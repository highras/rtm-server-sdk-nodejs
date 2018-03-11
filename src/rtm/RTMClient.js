'use strict'

const Emitter = require('events').EventEmitter;
const fs = require('fs');
const crypto = require('crypto');
const msgpack = require("msgpack-lite");
const Uint64BE = require("int64-buffer").Uint64BE;

const conf = require('../fpnn/FPConfig');
const FPClient = require('../fpnn/FPClient');

class RTMClient{
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
    constructor(options){
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

        this._client.on('connect', () => {
            this.emit('connect');
        });

        this._client.on('error', (err) => {
            this.emit('error', err);
        });

        this._msgOptions = { 
            codec: msgpack.createCodec({ int64: true }) 
        };
    }

    enableConnect(){
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
    enableEncryptorByData(peerPubData, options){
        if (!options){
            options = {};
        } 

        this._client.connectCryptor(peerPubData, options.curveName, options.strength, options.streamMode);
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
    enableEncryptorByFile(peerPubPath, options){
        let self = this;

        fs.readFile(peerPubPath, (err, data) => {
            if (err){
                self.emit('error', err);
                return;
            }
            self.enableEncryptorByData(data);
        });
    }

    /**
     * 
     * @param {Uint64BE} from 
     * @param {Uint64BE} to 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendMessage(from, to, mtype, msg, attrs, callback, timeout){
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
     * @param {Uint64BE} from 
     * @param {array<Uint64BE>} tos
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendMessages(from, tos, mtype, msg, attrs, callback, timeout){
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
     * @param {Uint64BE} from 
     * @param {Uint64BE} gid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendGroupMessage(from, gid, mtype, msg, attrs, callback, timeout){
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
     * @param {Uint64BE} from 
     * @param {Uint64BE} rid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendRoomMessage(from, rid, mtype, msg, attrs, callback, timeout){
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
     * @param {Uint64BE} from 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    broadcastMessage(from, mtype, msg, attrs, callback, timeout){
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
     * @param {Uint64BE} uid 
     * @param {array<Uint64BE>} friends 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addfriends(uid, friends, callback, timeout){
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
     * @param {Uint64BE} uid 
     * @param {array<Uint64BE>} friends 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    delFriends(uid, friends, callback, timeout){
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
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Uint64BE>} data
     */
    getFriends(uid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids){
                let buids = [];
                uids.forEach((item, index) => {
                    buids[index] = new Uint64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {Uint64BE} fuid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {bool} data
     */
    isFriend(uid, fuid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined){
                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {array<Uint64BE>} fuids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Uint64BE>} data
     */
    isFriends(uid, fuids, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let fuids = data['fuids'];
            if (fuids){
                let bfuids = [];
                fuids.forEach((item, index) => {
                    bfuids[index] = new Uint64BE(item);
                });

                callback(null, bfuids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} gid 
     * @param {array<Uint64BE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addGroupMembers(gid, uids, callback, timeout){
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
     * @param {Uint64BE} gid 
     * @param {array<Uint64BE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    deleteGroupMembers(gid, uids, callback, timeout){
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
     * @param {Uint64BE} gid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    deleteGroup(gid, callback, timeout){
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
     * @param {Uint64BE} gid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Uint64BE>} data
     */
    getGroupMembers(gid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids){
                let buids = [];
                uids.forEach((item, index) => {
                    buids[index] = new Uint64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} gid 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {bool} data
     */
    isGroupMember(gid, uid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined){
                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Uint64BE>} data
     */
    getUserGroups(uid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let gids = data['gids'];
            if (gids){
                let bgids = [];
                gids.forEach((item, index) => {
                    bgids[index] = new Uint64BE(item);
                });

                callback(null, bgids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {string} token 
     */
    getToken(uid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let token = data['token'];
            if (token !== undefined){
                callback(null, token);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {array<Uint64BE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Uint64BE>} uids 
     */
    getOnlineUsers(uids, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids){
                let buids = [];
                uids.forEach((item, index) => {
                    buids[index] = new Uint64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} gid 
     * @param {Uint64BE} uid 
     * @param {number} btime 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addGroupBan(gid, uid, btime, callback, timeout){
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
     * @param {Uint64BE} gid 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    removeGroupBan(gid, uid, callback, timeout){
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
     * @param {Uint64BE} rid 
     * @param {Uint64BE} uid 
     * @param {number} btime 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addRoomBan(rid, uid, btime, callback, timeout){
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
     * @param {Uint64BE} rid 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    removeRoomBan(rid, uid, callback, timeout){
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
     * @param {Uint64BE} uid 
     * @param {number} btime 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addProjectBlack(uid, btime, callback, timeout){
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
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    removeProjectBlack(uid, callback, timeout){
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
     * @param {Uint64BE} gid 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {bool} data
     */
    isBanOfGroup(gid, uid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined){
                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} rid 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {bool} data
     */
    isBanOfRoom(rid, uid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined){
                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {bool} data 
     */
    isProjectBlack(uid, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let ok = data['ok'];
            if (ok !== undefined){
                callback(null, ok);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {string} pushname 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    setPushName(uid, pushname, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid,
            pushname: pushname
        };

        let options = {
            flag: 1,
            method: 'setpushname',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {string} pushname 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {string} data 
     */
    getPushName(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt,
            uid: uid
        };

        let options = {
            flag: 1,
            method: 'getpushname',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let pushname = data['pushname'];
            if (pushname !== undefined){
                callback(null, pushname);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Uint64BE} uid 
     * @param {number} lat 
     * @param {number} lng 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    setGeo(uid, lat, lng, callback, timeout){
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
     * @param {Uint64BE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<lat:number, lng:number>} data 
     */
    getGeo(uid, callback, timeout){
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
     * @param {array<Uint64BE>} uids
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<array<uid:Uint64BE,lat:number,lng:number>>} data 
     */
    getGeos(uids, callback, timeout){
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

        sendQuest.call(this, this._client, options, (err, data) => {
            if (err){
                callback(err, null);
                return;
            }

            let geos = data['geos'];
            if (geos){
                let bgeos = [];
                geos.forEach((item, index) => {
                    item[0] = new Uint64BE(item[0]);
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
     * @param {Uint64BE} from 
     * @param {Uint64BE} to 
     * @param {number} mtype 
     * @param {string} filePath 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    sendFile(from, to, mtype, filePath, callback, timeout){
        let self = this;

        filetoken.call(this, from, to, (err, data) => {
            if (err){
                self.emit('error', err);
                return;
            }

            let token = data["token"];
            let endpoint = data["endpoint"];
            let ipport = endpoint.split(':');

            fs.readFile(filePath, (err, data) => {
                if (err){
                    self.emit('error', err);
                    return;
                }

                let sign = md5.call(self, md5.call(self, data) + ':' + token);
                let client = new FPClient({ 
                    host: ipport[0], 
                    port: +ipport[1], 
                    autoReconnect: false,
                    connectionTimeout: timeout
                });

                client.connect();
                client.on('connect', () => {
                    let options = {
                        token: token,
                        from: from,
                        to: to,
                        mtype: mtype,
                        sign: sign,
                        data: data
                    };
                    sendfile.call(self, client, options, callback, timeout);
                });
                client.on('error', (err) => {
                    self.emit('error', {src: 'file client', err: err });
                });
            });
        }, timeout);
    }
}

function filetoken(from, to, callback, timeout){
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

function sendfile(client, ops, callback, timeout){
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

function genMid(){
    let timestamp = Math.floor(Date.now() / 1000);
    return new Uint64BE(timestamp, this._midSeq++);
}

function genSalt(){
    let timestamp = Math.floor(Date.now() / 1000);
    return new Uint64BE(timestamp, this._saltSeq++);
}

function genSign(salt){
    return md5.call(this, this._pid + ':' + this._secretKey + ':' + salt).toUpperCase();
}

function md5(data){
    let hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
}

function isException(data){
    if (data === undefined){
        return false;
    }
    return data.hasOwnProperty('code') && data.hasOwnProperty('ex');
}

function sendQuest(client, options, callback, timeout){
    let self = this;
    client.sendQuest(options, (data) => {
        if (!callback){
            return;
        }

        if (data.payload){
            let payload = msgpack.decode(data.payload, this._msgOptions);
            if (isException.call(self, payload)){
                callback(payload, null);
                return;
            }

            callback(null, payload);
            return;
        }

        callback(null, data);
    }, timeout);
}

Object.setPrototypeOf(RTMClient.prototype, Emitter.prototype);
module.exports = RTMClient;