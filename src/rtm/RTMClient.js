'use strict'

const Emitter = require('events').EventEmitter;
const fs = require('fs');
const crypto = require('crypto');
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;

const FPClient = require('../fpnn/FPClient');
const RTMProcessor = require('./RTMProcessor');

class RTMClient {

    /**
     * 
     * @param {object} options 
     * 
     * options:
     * {number} options.pid 
     * {string} options.secretKey 
     * {string} options.host 
     * {numer} options.port 
     * {bool} options.autoReconnect 
     * {number} options.connectionTimeout 
     */
    constructor(options) {

        this._pid = options.pid;
        this._secretKey = options.secretKey;

        this._midSeq = 0;
        this._saltSeq = 0;

        this._client = new FPClient({ 
            host: options.host, 
            port: options.port, 
            autoReconnect: options.autoReconnect,
            connectionTimeout: options.connectionTimeout
        });

        let self = this;

        this._client.on('connect', function() {

            self._client.processor = self._processor;
            self.emit('connect');
        });

        this._client.on('error', function(err) {

            self.emit('error', err);
        });

        this._client.on('close', function() {

            self.emit('close');
        });

        this._msgOptions = {

            codec: msgpack.createCodec({ int64: true })
        };

        this._fileClient = null;
        this._processor = new RTMProcessor(this._msgOptions);
    }

    get processor() {

        return this._processor;
    }

    destroy() {

        this._midSeq = 0;
        this._saltSeq = 0;

        if (this._processor) {

            this._processor.destroy();
            this._processor = null;
        }

        if (this._client) {

            this._client.destroy();
            this._client = null;
        }

        if (this._fileClient) {

            this._fileClient.destroy();
            this._fileClient = null;
        }

        this.removeAllListeners();
    }

    enableConnect() {

        this._client.connect();
    }

    /**
     * 
     * @param {Buffer} peerPubData 
     * @param {object} options 
     * 
     * options:
     * {string} options.curveName 
     * {number} options.strength 
     * {bool} options.streamMode 
     */
    enableEncryptorByData(peerPubData, options) {

        if (!options) {

            options = {};
        } 

        this._client.encryptor(options.curveName, peerPubData, options.streamMode, options.strength);
        this._client.connect(function(fpEncryptor) {
            
            return msgpack.encode({ 
                publicKey:fpEncryptor.pubKey, 
                streamMode:fpEncryptor.streamMode, 
                bits:fpEncryptor.strength 
            })
        });
    }

    /**
     * 
     * @param {string} peerPubPath 
     * @param {object} options 
     * 
     * options:
     * {string} options.curveName 
     * {number} options.strength 
     * {bool} options.streamMode 
     */
    enableEncryptorByFile(peerPubPath, options) {
        
        let self = this;

        fs.readFile(peerPubPath, function(err, data) {

            if (err) {

                self.emit('error', err);
                return;
            }

            self.enableEncryptorByData(data, options);
        });
    }

    sendQuest(options, callback, timeout) {

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} from 
     * @param {Int64BE} to 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendMessage(from, to, mtype, msg, attrs, timeout, callback) {
        
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            to: to,
            mid: genMid.call(this),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} from 
     * @param {array<Int64BE>} tos
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendMessages(from, tos, mtype, msg, attrs, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            tos: tos,
            mid: genMid.call(this),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsgs',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} from 
     * @param {Int64BE} gid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendGroupMessage(from, gid, mtype, msg, attrs, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            gid: gid,
            mid: genMid.call(this),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendgroupmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} from 
     * @param {Int64BE} rid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendRoomMessage(from, rid, mtype, msg, attrs, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            rid: rid,
            mid: genMid.call(this),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendroommsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} from 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    broadcastMessage(from, mtype, msg, attrs, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            mid: genMid.call(this),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'broadcastmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {array<Int64BE>} friends 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addFriends(uid, friends, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'addfriends',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {array<Int64BE>} friends 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    deleteFriends(uid, friends, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'delfriends',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64BE>} data
     */
    getFriends(uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'getfriends',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {

                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new Int64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {Int64BE} fuid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {bool} data
     */
    isFriend(uid, fuid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            fuid: fuid
        };

        let options = {
            flag: 1,
            method: 'isfriend',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {array<Int64BE>} fuids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64BE>} data
     */
    isFriends(uid, fuids, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            fuids: fuids
        };

        let options = {
            flag: 1,
            method: 'isfriends',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let fuids = data['fuids'];
            if (fuids) {

                let bfuids = [];
                fuids.forEach(function(item, index) {

                    bfuids[index] = new Int64BE(item);
                });

                callback(null, bfuids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {array<Int64BE>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addGroupMembers(gid, uids, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'addgroupmembers',
            payload: msgpack.encode(payload, this._msgOptions)
        };
        
        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {array<Int64BE>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    deleteGroupMembers(gid, uids, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'delgroupmembers',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    deleteGroup(gid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid
        };

        let options = {
            flag: 1,
            method: 'delgroup',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64BE>} data
     */
    getGroupMembers(gid, timeout, callback) {
        
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid
        };

        let options = {
            flag: 1,
            method: 'getgroupmembers',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {

                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new Int64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {bool} data
     */
    isGroupMember(gid, uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'isgroupmember',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64BE>} data
     */
    getUserGroups(uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'getusergroups',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let gids = data['gids'];
            if (gids) {

                let bgids = [];
                gids.forEach(function(item, index) {

                    bgids[index] = new Int64BE(item);
                });

                callback(null, bgids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {string} token 
     */
    getToken(uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'gettoken',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let token = data['token'];
            if (token !== undefined) {

                callback(null, token);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64BE>} uids 
     */
    getOnlineUsers(uids, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getonlineusers',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {

                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new Int64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {Int64BE} uid 
     * @param {number} btime 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addGroupBan(gid, uid, btime, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid,
            uid: uid,
            btime: btime 
        };

        let options = {
            flag: 1,
            method: 'addgroupban',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    removeGroupBan(gid, uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'removegroupban',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} rid 
     * @param {Int64BE} uid 
     * @param {number} btime 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addRoomBan(rid, uid, btime, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            rid: rid,
            uid: uid,
            btime: btime
        };

        let options = {
            flag: 1,
            method: 'addroomban',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} rid 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    removeRoomBan(rid, uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            rid: rid,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'removeroomban',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} btime 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addProjectBlack(uid, btime, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            btime: btime
        };

        let options = {
            flag: 1,
            method: 'addprojectblack',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    removeProjectBlack(uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'removeprojectblack',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {bool} data
     */
    isBanOfGroup(gid, uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'isbanofgroup',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {
            
            if (err) {

                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {
                
                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} rid 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {bool} data
     */
    isBanOfRoom(rid, uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            rid: rid,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'isbanofroom',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {bool} data 
     */
    isProjectBlack(uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'isprojectblack',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} lat 
     * @param {number} lng 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    setGeo(uid, lat, lng, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            lat: lat,
            lng: lng
        };

        let options = {
            flag: 1,
            method: 'setgeo',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<lat:number, lng:number>} data 
     */
    getGeo(uid, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'getgeo',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} uids
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<array<uid:Int64BE,lat:number,lng:number>>} data 
     */
    getGeos(uids, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getgeos',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let geos = data['geos'];
            if (geos) {

                let bgeos = [];
                geos.forEach(function(item, index) {

                    item[0] = new Int64BE(item[0]);
                    bgeos[index] = item;
                });

                callback(null, bgeos);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} from 
     * @param {Int64BE} to 
     * @param {number} mtype 
     * @param {string} filePath 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    sendFile(from, to, mtype, filePath, timeout, callback) {

        let self = this;

        filetoken.call(this, from, to, function(err, data) {
            
            if (err) {

                self.emit('error', err);
                return;
            }

            let token = data["token"];
            let endpoint = data["endpoint"];

            if (!token || !endpoint) {

                self.emit('error', data);
                return;
            }

            let ipport = endpoint.split(':');

            fs.readFile(filePath, function(err, data) {

                if (err) {

                    self.emit('error', err);
                    return;
                }

                let sign = md5.call(self, md5.call(self, data) + ':' + token);

                if (!self._fileClient) {

                    self._fileClient = new FPClient({ 

                        host: ipport[0],
                        port: +ipport[1],
                        autoReconnect: false,
                        connectionTimeout: timeout
                    });

                    // self._fileClient.on('connect', function() {});
                    // self._fileClient.on('close', function() {});
                    self._fileClient.on('error', function(err) {

                        self.emit('error', new Error('file client: ' + err.message));
                    });
                }

                if (!self._fileClient.hasConnect) {

                    self._fileClient.connect();
                }

                let options = {

                    token: token,
                    from: from,
                    to: to,
                    mtype: mtype,
                    sign: sign,
                    data: data
                };

                sendfile.call(self, self._fileClient, options, callback, timeout);
            });
        }, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} opts.gids 
     * @param {array<Int64BE>} opts.rids 
     * @param {bool} opts.p2p 
     * @param {array<string>} opts.events 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    addEvtListener(opts, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt
        };

        if (opts.gids) {

            payload.gids = opts.gids;
        }

        if (opts.rids) {
            
            payload.rids = opts.rids;
        }

        if (opts.p2p) {

            payload.p2p = true;
        }

        if (opts.events) {

            payload.events = opts.events;
        }

        let options = {
            flag: 1,
            method: 'addlisten',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} opts.gids 
     * @param {array<Int64BE>} opts.rids 
     * @param {bool} opts.p2p 
     * @param {array<string>} opts.events 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    removeEvtListener(opts, timeout, callback) {
        
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt
        };

        if (opts.gids) {
            
            payload.gids = opts.gids;
        }

        if (opts.rids) {

            payload.rids = opts.rids;
        }

        if (opts.p2p) {

            payload.p2p = true;
        }

        if (opts.events) {

            payload.events = opts.events;
        }

        let options = {
            flag: 1,
            method: 'removelisten',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {bool} opts 
     * @param {array<Int64BE>} opts.gids 
     * @param {array<Int64BE>} opts.rids 
     * @param {bool} opts.p2p 
     * @param {array<string>} opts.events 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    setEvtListener(opts, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt
        };

        if (typeof(opts) == 'boolean') {

            payload.all = opts;
        }

        payload.gids = opts.gids || [];
        payload.rids = opts.rids || [];
        payload.p2p = opts.p2p || false;
        payload.events = opts.events || [];

        let options = {
            flag: 1,
            method: 'setlisten',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid
     * @param {string} apptype
     * @param {string} devicetoken
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    addDevice(uid, apptype, devicetoken, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            apptype: apptype,
            devicetoken: devicetoken 
        };

        let options = {
            flag: 1,
            method: 'adddevice',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} uid 
     * @param {string} devicetoken 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    removeDevice(uid, devicetoken, timeout, callback) {

        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            devicetoken: devicetoken 
        };

        let options = {
            flag: 1,
            method: 'removedevice',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }
}

function filetoken(from, to, callback, timeout) {

    let salt = genSalt.call(this);

    let payload = {
        pid: this._pid,
        sign: genSign.call(this, salt.toString()),
        salt: salt,
        cmd: 'sendfile',
        from: from,
        to: to
    };

    let options = {
        flag: 1,
        method: 'filetoken',
        payload: msgpack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, this._client, options, callback, timeout);
}

function sendfile(client, ops, callback, timeout) {

    let payload = {
        pid: this._pid,
        token: ops.token,
        mtype: ops.mtype,
        from: ops.from,
        to: ops.to,
        mid: genMid.call(this),
        file: ops.data,
        attrs: JSON.stringify({ sign: ops.sign })
    };

    let options = {
        flag: 1,
        method: 'sendfile',
        payload: msgpack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, client, options, callback, timeout);
}

function genMid() {

    if (++this._midSeq >= 999) {

        this._midSeq = 0;
    }

    return new Int64BE(Date.now().toString() + this._midSeq);
}

function genSalt() {

    if (++this._saltSeq >= 999) {

        this._saltSeq = 0;
    }

    return new Int64BE(Date.now().toString() + this._saltSeq);
}

function genSign(salt) {

    return md5.call(this, this._pid + ':' + this._secretKey + ':' + salt).toUpperCase();
}

function md5(data) {

    let hash = crypto.createHash('md5');
    hash.update(data);

    return hash.digest('hex');
}

function isException(data) {

    if (!data) {

        return null;
    }

    if (data instanceof Error) {

        return data;
    }

    if (data.hasOwnProperty('code') && data.hasOwnProperty('ex')) {

        return new Error('code: ' + data.code + ', ex: ' + data.ex);
    }

    return null;
}

function sendQuest(client, options, callback, timeout) {

    let self = this;

    if (!client) {

        callback && callback(new Error('client has been destroyed!'), null);
        return;
    }

    client.sendQuest(options, function(data) {

        if (!callback) {

            return;
        }

        let err = null;

        if (data.payload) {

            let payload = msgpack.decode(data.payload, self._msgOptions);
            err = isException.call(self, payload);

            if (err) {

                callback(err, null);
                return;
            }

            callback(null, payload);
            return;
        }

        err = isException.call(self, data);
        if (err) {

            callback(data, null);
            return;
        }

        callback(null, data);
    }, timeout);
}

Object.setPrototypeOf(RTMClient.prototype, Emitter.prototype);
module.exports = RTMClient;