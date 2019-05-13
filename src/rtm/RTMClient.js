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

        this._baseClient = new FPClient({ 
            host: options.host, 
            port: options.port, 
            autoReconnect: options.autoReconnect,
            connectionTimeout: options.connectionTimeout
        });

        let self = this;

        this._baseClient.on('connect', function() {

            self._baseClient.processor = self._processor;
            self.emit('connect');
        });

        this._baseClient.on('error', function(err) {

            self.emit('error', err);
        });

        this._baseClient.on('close', function() {

            self.emit('close');
        });

        this._msgOptions = {

            codec: msgpack.createCodec({ int64: true })
        };

        this._processor = new RTMProcessor(this._msgOptions);
    }

    get processor() {

        return this._processor;
    }

    destroy() {

        this._midSeq = 0;

        if (this._processor) {

            this._processor.destroy();
            this._processor = null;
        }

        if (this._baseClient) {

            this._baseClient.destroy();
            this._baseClient = null;
        }

        this.removeAllListeners();
    }

    enableConnect() {

        this._baseClient.connect();
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

        this._baseClient.encryptor(options.curveName, peerPubData, options.streamMode, options.strength);
        this._baseClient.connect(function(fpEncryptor) {
            
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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (1)
     *  
     * @param {Int64BE} from 
     * @param {Int64BE} to 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64BE} mid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64BE, error:Error>} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    sendMessage(from, to, mtype, msg, attrs, mid, timeout, callback) {
        
        let salt = genMid.call(this);

        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            to: to,
            mid: mid,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new Int64BE(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    /**
     *  
     * ServerGate (2)
     * 
     * @param {Int64BE} from 
     * @param {array<Int64BE>} tos
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64BE} mid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64BE, error:Error>} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    sendMessages(from, tos, mtype, msg, attrs, mid, timeout, callback) {

        let salt = genMid.call(this);

        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            tos: tos,
            mid: mid,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsgs',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new Int64BE(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    /**
     *  
     * ServerGate (3)
     * 
     * @param {Int64BE} from 
     * @param {Int64BE} gid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64BE} mid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64BE, error:Error>} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    sendGroupMessage(from, gid, mtype, msg, attrs, mid, timeout, callback) {

        let salt = genMid.call(this);

        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            gid: gid,
            mid: mid,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendgroupmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new Int64BE(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    /**
     *  
     * ServerGate (4)
     * 
     * @param {Int64BE} from 
     * @param {Int64BE} rid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64BE} mid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64BE, error:Error>} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    sendRoomMessage(from, rid, mtype, msg, attrs, mid, timeout, callback) {

        let salt = genMid.call(this);

        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            rid: rid,
            mid: mid,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendroommsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new Int64BE(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    /**
     *  
     * ServerGate (5)
     * 
     * @param {Int64BE} from 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {Int64BE} mid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {object<mid:Int64BE, error:Error>} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    broadcastMessage(from, mtype, msg, attrs, mid, timeout, callback) {

        let salt = genMid.call(this);

        if (!mid || mid.toString() == '0') {

            mid = genMid.call(this);
        }

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mtype: mtype,
            from: from,
            mid: mid,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'broadcastmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback({ mid: payload.mid, error: err }, null);
                return;
            }

            if (data.mtime !== undefined) {

                data.mtime = new Int64BE(data.mtime);
            }

            callback && callback(null, { mid: payload.mid, payload: data });
        }, timeout);
    }

    /**
     *  
     * ServerGate (6)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (7)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (8)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {

                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new Int64BE(item);
                });

                callback && callback(null, buids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (9)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback && callback(null, ok);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (10)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let fuids = data['fuids'];
            if (fuids) {

                let bfuids = [];
                fuids.forEach(function(item, index) {

                    bfuids[index] = new Int64BE(item);
                });

                callback && callback(null, bfuids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (11)
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

        let salt = genMid.call(this);

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
        
        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (12)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (13)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (14)
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
        
        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {

                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new Int64BE(item);
                });

                callback && callback(null, buids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (15)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback && callback(null, ok);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (16)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let gids = data['gids'];
            if (gids) {

                let bgids = [];
                gids.forEach(function(item, index) {

                    bgids[index] = new Int64BE(item);
                });

                callback && callback(null, bgids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (17)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let token = data['token'];
            if (token !== undefined) {

                callback && callback(null, token);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (18)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {

                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new Int64BE(item);
                });

                callback && callback(null, buids);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (19)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (20)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (21)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (22)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (23)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (24)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (25)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {
            
            if (err) {

                callback && callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {
                
                callback && callback(null, ok);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (26)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback && callback(null, ok);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (27)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined) {

                callback && callback(null, ok);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (28)
     * 
     * @param {Int64BE} from 
     * @param {string} cmd
     * @param {array<Int64BE>} tos 
     * @param {Int64BE} to 
     * @param {Int64BE} rid 
     * @param {Int64BE} gid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<token:string, endpoint:string>} data 
     */
    fileToken(from, cmd, tos, to, rid, gid, timeout, callback) {

        let options = {
            from: from,
            cmd: cmd
        }

        if (tos !== undefined) {

            options.tos = tos;
        }

        if (to !== undefined) {

            options.to = to;
        }

        if (rid !== undefined) {

            options.rid = rid;
        }

        if (gid !== undefined) {

            options.gid = gid;
        }

        filetoken.call(this, options, callback, timeout); 
    }

    /**
     *  
     * ServerGate (29)
     * 
     * @param {Int64BE} gid 
     * @param {bool} desc 
     * @param {number} num
     * @param {Int64BE} begin
     * @param {Int64BE} end
     * @param {Int64BE} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array<GroupMsg>>} data 
     * 
     * <GroupMsg>
     * @param {Int64BE} GroupMsg.id
     * @param {Int64BE} GroupMsg.from
     * @param {number} GroupMsg.mtype
     * @param {Int64BE} GroupMsg.mid
     * @param {bool} GroupMsg.deleted
     * @param {string} GroupMsg.msg
     * @param {string} GroupMsg.attrs
     * @param {Int64BE} GroupMsg.mtime
     */
    getGroupMessage(gid, desc, num, begin, end, lastid, timeout, callback) {
        
        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            gid: gid,
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        let options = {
            flag: 1,
            method: 'getgroupmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    msgs[index] = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (30)
     * 
     * @param {Int64BE} rid 
     * @param {bool} desc 
     * @param {number} num
     * @param {Int64BE} begin
     * @param {Int64BE} end
     * @param {Int64BE} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array<RoomMsg>>} data 
     * 
     * <RoomMsg>
     * @param {Int64BE} RoomMsg.id
     * @param {Int64BE} RoomMsg.from
     * @param {number} RoomMsg.mtype
     * @param {Int64BE} RoomMsg.mid
     * @param {bool} RoomMsg.deleted
     * @param {string} RoomMsg.msg
     * @param {string} RoomMsg.attrs
     * @param {Int64BE} RoomMsg.mtime
     */
    getRoomMessage(rid, desc, num, begin, end, lastid, timeout, callback) {

        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            rid: rid,
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        let options = {
            flag: 1,
            method: 'getroommsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    msgs[index] = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (31)
     * 
     * @param {bool} desc 
     * @param {number} num
     * @param {Int64BE} begin
     * @param {Int64BE} end
     * @param {Int64BE} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array<BroadcastMsg>>} data 
     * 
     * <BroadcastMsg>
     * @param {Int64BE} BroadcastMsg.id
     * @param {Int64BE} BroadcastMsg.from
     * @param {number} BroadcastMsg.mtype
     * @param {Int64BE} BroadcastMsg.mid
     * @param {bool} BroadcastMsg.deleted
     * @param {string} BroadcastMsg.msg
     * @param {string} BroadcastMsg.attrs
     * @param {Int64BE} BroadcastMsg.mtime
     */
    getBroadcastMessage(desc, num, begin, end, lastid, timeout, callback) {

        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        let options = {
            flag: 1,
            method: 'getbroadcastmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    msgs[index] = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (32)
     * 
     * @param {Int64BE} uid 
     * @param {Int64BE} ouid 
     * @param {bool} desc
     * @param {number} num 
     * @param {Int64BE} begin 
     * @param {Int64BE} end
     * @param {Int64BE} lastid
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array<P2PMsg>>} data 
     * 
     * <P2PMsg>
     * @param {Int64BE} P2PMsg.id
     * @param {number} P2PMsg.direction
     * @param {number} P2PMsg.mtype
     * @param {Int64BE} P2PMsg.mid
     * @param {bool} P2PMsg.deleted
     * @param {string} P2PMsg.msg
     * @param {string} P2PMsg.attrs
     * @param {Int64BE} P2PMsg.mtime
     */
    getP2PMessage(uid, ouid, desc, num, begin, end, lastid, timeout, callback) {

        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            ouid: ouid,
            desc: desc,
            num: num
        };

        if (begin !== undefined) {

            payload.begin = begin;
        }

        if (end !== undefined) {

            payload.end = end;
        }

        if (lastid !== undefined) {

            payload.lastid = lastid;
        }

        let options = {
            flag: 1,
            method: 'getp2pmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, function(err, data) {

            if (err) {

                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                msgs.forEach(function(item, index) {

                    msgs[index] = {
                        id: new Int64BE(item[0]),
                        direction: Number(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                });
            }

            callback && callback(null, data);
        }, timeout);
    }

    /**
     *  
     * ServerGate (33)
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
    addRoomMember(rid, uid, timeout, callback) {

        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            rid: rid,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'addroommember',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (34)
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
    deleteRoomMember(rid, uid, timeout, callback) {

        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            rid: rid,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'delroommember',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (35)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (36)
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
        
        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (37)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (38)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (39)
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

        let salt = genMid.call(this);

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

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (40)
     * 
     * @param {Int64BE} mid 
     * @param {Int64BE} from 
     * @param {Int64BE} xid 
     * @param {number} type 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    deleteMessage(mid, from, xid, type, timeout, callback) {

        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            mid: mid,
            from: from,
            xid: xid,
            type: type
        };

        let options = {
            flag: 1,
            method: 'delmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * ServerGate (41)
     * 
     * @param {Int64BE} uid 
     * @param {string} ce 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    kickout(uid, ce, timeout, callback) {

        let salt = genMid.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };
 
        if (ce !== undefined) {

            payload.ce = ce;
        }

        let options = {
            flag: 1,
            method: 'kickout',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._baseClient, options, callback, timeout);
    }

    /**
     *  
     * fileGate (1)
     * 
     * @param {Int64BE} from 
     * @param {Int64BE} to 
     * @param {number} mtype 
     * @param {string} filePath 
     * @param {Int64BE} mid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data 
     */
    sendFile(from, to, mtype, filePath, mid, timeout, callback) {

        let options = {
            from: from,
            to: to,
            mtype: mtype,
            cmd: 'sendfile'
        };

        fileSendProcess.call(this, options, filePath, mid, callback, timeout);
    }

    /**
     *  
     * filegate (2)
     * 
     * @param {Int64BE} from 
     * @param {array<Int64BE>} tos 
     * @param {number} mtype 
     * @param {string} filepath 
     * @param {Int64BE} mid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {error} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data 
     */
    sendFiles(from, tos, mtype, filepath, mid, timeout, callback) {

        let options = {
            from: from,
            tos: tos,
            mtype: mtype,
            cmd: 'sendfiles'
        };

        fileSendProcess.call(this, options, filepath, mid, callback, timeout);
    }

    /**
     *  
     * filegate (3)
     * 
     * @param {Int64BE} from
     * @param {Int64BE} gid
     * @param {number} mtype
     * @param {string} filepath
     * @param {Int64BE} mid
     * @param {number} timeout
     * @param {function} callback 
     * 
     * @callback
     * @param {error} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    sendGroupFile(from, gid, mtype, filepath, mid, timeout, callback) {

        let options = {
            from: from,
            gid: gid,
            mtype: mtype,
            cmd: 'sendgroupfile'
        };

        fileSendProcess.call(this, options, filepath, mid, callback, timeout);
    }

    /**
     *  
     * filegate (4)
     * 
     * @param {Int64BE} from
     * @param {Int64BE} rid
     * @param {number} mtype
     * @param {string} filepath
     * @param {Int64BE} mid
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {error} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    sendRoomFile(from, rid, mtype, filepath, mid, timeout, callback) {

        let options = {
            from: from,
            rid: rid,
            mtype: mtype,
            cmd: 'sendroomfile'
        };

        fileSendProcess.call(this, options, filepath, mid, callback, timeout);
    }

    /**
     *  
     * filegate (5)
     * 
     * @param {Int64BE} from
     * @param {number} mtype
     * @param {string} filepath
     * @param {Int64BE} mid
     * @param {number} timeout
     * @param {function} callback
     * 
     * @callback
     * @param {error} err
     * @param {object<mid:Int64BE, payload:object<mtime:Int64BE>>} data
     */
    broadcastFile(from, mtype, filepath, mid, timeout, callback) {

        let options = {
            from: from,
            mtype: mtype,
            cmd: 'broadcastfile'
        };

        fileSendProcess.call(this, options, filepath, mid, callback, timeout);
    }
}

function fileSendProcess(ops, filePath, mid, callback, timeout) {

    let self = this;
    
    if (!mid || mid.toString() == '0') {

        mid = genMid.call(this);
    }

    filetoken.call(this, ops, function(err, data) {
        
        if (err) {

            callback && callback({ mid: mid, error: err }, null);
            return;
        }

        let token = data["token"];
        let endpoint = data["endpoint"];

        let ext = null;
        let index = filePath.lastIndexOf('.');

        if (index != -1) {

            ext = filePath.slice(index + 1);
        }

        if (!token || !endpoint) {

            callback && callback({ mid: mid, error: new Error(JSON.stringify(data)) }, null);
            return;
        }

        let ipport = endpoint.split(':');

        fs.readFile(filePath, function(err, content) {

            if (err) {

                callback && callback({ mid: mid, error: err }, null);
                return;
            }

            let sign = md5.call(self, md5.call(self, content) + ':' + token);

            let fileClient = new FPClient({ 

                host: ipport[0],
                port: +(ipport[1]),
                autoReconnect: false,
                connectionTimeout: timeout
            });

            fileClient.on('close', function(){

                self.destroy();
            });

            fileClient.on('error', function(err) {

                self.emit('error', new Error('file client: ' + err.message));
            });

            fileClient.connect();

            let options = {
                token: token,
                sign: sign,
                ext: ext,
                file: content
            };

            for (let key in ops) {

                options[key] = ops[key];
            }

            sendfile.call(self, fileClient, options, mid, callback, timeout);
        });
    }, timeout);
}

function filetoken(ops, callback, timeout) {

    let salt = genMid.call(this);

    let payload = {
        pid: this._pid,
        sign: genSign.call(this, salt.toString()),
        salt: salt
    };

    for (let key in ops) {

        if (key == 'mtype') {

            continue;
        }

        payload[key] = ops[key];
    }

    let options = {
        flag: 1,
        method: 'filetoken',
        payload: msgpack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, this._baseClient, options, callback, timeout);
}

function sendfile(fileClient, ops, mid, callback, timeout) {

    let payload = {
        pid: this._pid,
        mid: mid
    };

    for (let key in ops) {

        if (key == 'sign') {

            payload.attrs = JSON.stringify({ sign: ops.sign, ext: ops.ext });
            continue;
        }

        if (key == 'ext') {

            continue;
        }

        if (key == 'cmd') {

            continue;
        }

        payload[key] = ops[key];
    }

    let options = {
        flag: 1,
        method: ops.cmd,
        payload: msgpack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, fileClient, options, function(err, data) {

        fileClient.destroy();

        if (err) {

            callback && callback({ mid: payload.mid, error: err }, null);
            return;
        }

        if (data.mtime !== undefined) {

            data.mtime = new Int64BE(data.mtime);
        }

        callback && callback(null, { mid: payload.mid, payload: data });
    }, timeout);
}

function genMid() {

    if (++this._midSeq >= 999) {

        this._midSeq = 0;
    }

    let strFix = this._midSeq.toString();

    if (this._midSeq < 100) {

        strFix = '0' + strFix;
    }

    if (this._midSeq < 10) {

        strFix = '0' + strFix;
    } 

    return new Int64BE(Date.now().toString() + strFix);
}

function genSign(salt) {

    return md5.call(this, this._pid + ':' + this._secretKey + ':' + salt).toUpperCase();
}

function md5(data) {

    let hash = crypto.createHash('md5');
    hash.update(data);

    return hash.digest('hex');
}

function isException(isAnswerErr, data) {

    if (!data) {

        return new Error('data is null!');
    }

    if (data instanceof Error) {

        return data;
    }

    if (isAnswerErr) {

        if (data.hasOwnProperty('code') && data.hasOwnProperty('ex')) {

            return new Error('code: ' + data.code + ', ex: ' + data.ex);
        }
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
        let isAnswerErr = false;

        if (data.payload) {

            let payload = msgpack.decode(data.payload, self._msgOptions);

            if (data.mtype == 2) {

                isAnswerErr = data.ss != 0;
            }

            err = isException.call(self, isAnswerErr, payload);

            if (err) {

                callback && callback(err, null);
                return;
            }

            callback && callback(null, payload);
            return;
        }

        err = isException.call(self, isAnswerErr, data);
        
        if (err) {

            callback && callback(err, null);
            return;
        }

        callback && callback(null, data);
    }, timeout);
}

Object.setPrototypeOf(RTMClient.prototype, Emitter.prototype);
module.exports = RTMClient;