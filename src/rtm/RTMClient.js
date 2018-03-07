'use strict'

const Emitter = require('events').EventEmitter;
const fs = require('fs');
const crypto = require('crypto');
const Uint64LE = require("int64-buffer").Uint64LE;

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
     * @param {Uint64LE} from 
     * @param {Uint64LE} to 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    sendMessage(from, to, mtype, msg, attrs, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            mtype: mtype,
            from: from.toBuffer(),
            to: to.toBuffer(),
            mid: genMid.call(this).toBuffer(),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsg',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} from 
     * @param {array<Uint64LE>} tos
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    sendMessages(from, tos, mtype, msg, attrs, callback, timeout){
        let salt = genSalt.call(this);

        let btos = [];
        tos.forEach((item, index) => {  
            btos[index] = item.toBuffer();
        });  

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            mtype: mtype,
            from: from.toBuffer(),
            tos: btos,
            mid: genMid.call(this).toBuffer(),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsgs',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} from 
     * @param {Uint64LE} gid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    sendGroupMessage(from, gid, mtype, msg, attrs, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            mtype: mtype,
            from: from.toBuffer(),
            gid: gid.toBuffer(),
            mid: genMid.call(this).toBuffer(),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendgroupmsg',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} from 
     * @param {Uint64LE} rid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    sendRoomMessage(from, rid, mtype, msg, attrs, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            mtype: mtype,
            from: from.toBuffer(),
            rid: rid.toBuffer(),
            mid: genMid.call(this).toBuffer(),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendroommsg',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} from 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    broadcastMessage(from, mtype, msg, attrs, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            mtype: mtype,
            from: from.toBuffer(),
            mid: genMid.call(this).toBuffer(),
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'broadcastmsg',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {array<Uint64LE>} friends 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    addfriends(uid, friends, callback, timeout){
        let salt = genSalt.call(this);

        let bfs = [];
        friends.forEach((item, index) => {
            bfs[index] = item.toBuffer();
        });

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer(),
            friends: bfs
        };

        let options = {
            flag: 1,
            method: 'addfriends',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {array<Uint64LE>} friends 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    delFriends(uid, friends, callback, timeout){
        let salt = genSalt.call(this);

        let bfs = [];
        friends.forEach((item, index) => {
            bfs[index] = item.toBuffer();
        });

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer(),
            friends: bfs
        };

        let options = {
            flag: 1,
            method: 'delfriends',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {array<Uint64LE>} uids
     */
    getFriends(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'getfriends',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                let buids = [];
                if (data.payload){
                    let uids = data.payload['uids'];
                    uids.forEach((item, index) => {
                        uids[index] = new Uint64LE(item);
                    });

                    data.payload = { uids: buids };
                }

                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {Uint64LE} fuid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {bool} ok 
     */
    isFriend(uid, fuid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer(),
            fuid: fuid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'isfriend',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {array<Uint64LE>} fuids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {array<Uint64LE>} fuids
     */
    isFriends(uid, fuids, callback, timeout){
        let salt = genSalt.call(this);

        let bfuids = [];
        fuids.forEach((item, index) => {
            bfuids[index] = item.toBuffer();
        });

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer(),
            fuids: bfuids
        };

        let options = {
            flag: 1,
            method: 'isfriends',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                let bfuids = [];
                if (data.payload){
                    let fuids = data.payload['fuids'];
                    fuids.forEach((item, index) => {
                        bfuids[index] = new Uint64LE(item);
                    });

                    data.payload = { fuids: bfuids };
                }
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {array<Uint64LE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    addGroupMembers(gid, uids, callback, timeout){
        let salt = genSalt.call(this);

        let buids = [];
        uids.forEach((item, index) => {
            buids[index] = item.toBuffer();
        });

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer(),
            uids: buids
        };

        let options = {
            flag: 1,
            method: 'addgroupmembers',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {array<Uint64LE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    deleteGroupMembers(gid, uids, callback, timeout){
        let salt = genSalt.call(this);

        let buids = [];
        uids.forEach((item, index) => {
            buids[index] = item.toBuffer();
        });

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer(),
            uids: buids
        };

        let options = {
            flag: 1,
            method: 'delgroupmembers',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    deleteGroup(gid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'delgroup',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {array<Uint64LE>} uids
     */
    getGroupMembers(gid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'getgroupmembers',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                let buids = [];
                if (data.payload){
                    let uids = data.payload['uids'];
                    uids.forEach((item, index) => {
                        buids[index] = new Uint64LE(item);
                    });

                    data.payload = { uids: buids };
                }
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {bool} ok 
     */
    isGroupMember(gid, uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'isgroupmember',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {array<Uint64LE>} gids 
     */
    getUserGroups(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'getusergroups',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                let bgids = [];
                if (data.payload){
                    let gids = data.payload['gids'];
                    gids.forEach((item, index) => {
                        bgids[index] = new Uint64LE(item);
                    });

                    data.payload = { gids: bgids };
                }
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {string} token 
     */
    getToken(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'gettoken',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {array<Uint64LE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {array<Uint64LE>} uids 
     */
    getOnlineUsers(uids, callback, timeout){
        let salt = genSalt.call(this);

        let buids = [];
        uids.forEach((item, index) => {
            buids[index] = new Uint64LE(item);
        });

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uids: buids
        };

        let options = {
            flag: 1,
            method: 'getonlineusers',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                let buids = [];
                if (data.payload){
                    let uids = data.payload['uids'];
                    uids.forEach((item, index) => {
                        buids[index] = new Uint64LE(item);
                    });

                    data.payload = { uids: buids };
                }
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {Uint64LE} uid 
     * @param {number} btime 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    addGroupBan(gid, uid, btime, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer(),
            uid: uid.toBuffer(),
            btime: btime 
        };

        let options = {
            flag: 1,
            method: 'addgroupban',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    removeGroupBan(gid, uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'removegroupban',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} rid 
     * @param {Uint64LE} uid 
     * @param {number} btime 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    addRoomBan(rid, uid, btime, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            rid: rid.toBuffer(),
            uid: uid.toBuffer(),
            btime: btime
        };

        let options = {
            flag: 1,
            method: 'addroomban',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} rid 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    removeRoomBan(rid, uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            rid: rid.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'removeroomban',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {number} btime 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    addProjectBlack(uid, btime, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer(),
            btime: btime
        };

        let options = {
            flag: 1,
            method: 'addprojectblack',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    removeProjectBlack(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'removeprojectblack',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} gid 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {bool} ok
     */
    isBanOfGroup(gid, uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            gid: gid.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'isbanofgroup',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} rid 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {bool} ok
     */
    isBanOfRoom(rid, uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            rid: rid.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'isbanofroom',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {bool} ok
     */
    isProjectBlack(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'isprojectblack',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {string} pushname 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    setPushName(uid, pushname, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer(),
            pushname: pushname
        };

        let options = {
            flag: 1,
            method: 'setpushname',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {string} pushname 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {string} pushname
     */
    getPushName(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'getpushname',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {number} lat 
     * @param {number} lng 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    setGeo(uid, lat, lng, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer(),
            lat: lat,
            lng: lng
        };

        let options = {
            flag: 1,
            method: 'setgeo',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} uid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {number} lat 
     * @param {number} lng 
     */
    getGeo(uid, callback, timeout){
        let salt = genSalt.call(this);

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uid: uid.toBuffer()
        };

        let options = {
            flag: 1,
            method: 'getgeo',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {array<Uint64LE>} uids
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {array<uid:Uint64LE,lat:number,lng:number>} list
     */
    getGeos(uids, callback, timeout){
        let salt = genSalt.call(this);

        let buids = [];
        uids.forEach((item, index) => {
            buids[index] = new Uint64LE(item);
        });

        let payload = {
            pid: this._pid,
            sign: genSign.call(this, salt.toString()),
            salt: salt.toBuffer(),
            uids: buids
        };

        let options = {
            flag: 1,
            method: 'getgeos',
            payload: msgpack.encode(payload)
        };

        this._client.sendQuest(options, (data) => {
            if (callback){
                let blist = [];
                if (data.payload){
                    let list = data.payload['list'];
                    list.forEach((item, index) => {
                        item[0] = new Uint64LE(item[0]);
                        blist[index] = item;
                    });

                    data.payload = { list: blist };
                }
                callback(data.payload || data);
            }
        }, timeout);
    }

    /**
     * 
     * @param {Uint64LE} from 
     * @param {Uint64LE} to 
     * @param {number} mtype 
     * @param {string} filePath 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     */
    sendFile(from, to, mtype, filePath, callback, timeout){
        let self = this;

        filetoken.call(this, from, to, (data) => {
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
                    port: ipport[1], 
                    autoReconnect: false,
                    connectionTimeout: timeout
                });

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
            });
        }, timeout);
    }
}

function filetoken(from, to, callback, timeout){
    let salt = genSalt.call(this);

    let payload = {
        pid: this._pid,
        sign: genSign.call(this, salt.toString()),
        salt: salt.toBuffer(),
        cmd: 'sendfile',
        from: from.toBuffer(),
        to: to.toBuffer()
    };

    let options = {
        flag: 1,
        method: 'filetoken',
        payload: msgpack.encode(payload)
    };

    this._client.sendQuest(options, (data) => {
        if (callback){
            callback(data.payload || data);
        }
    }, timeout);
}

function sendfile(client, ops, callback, timeout){
    let payload = {
        pid: this._pid,
        token: ops.token,
        mtype: ops.mtype,
        from: ops.from.toBuffer(),
        to: ops.to.toBuffer(),
        mid: genMid.call(this).toBuffer(),
        file: ops.data,
        attrs: JSON.stringify({ sign: ops.sign })
    };

    let options = {
        flag: 1,
        method: 'sendfile',
        payload: msgpack.encode(payload)
    };

    client.sendQuest(options, (data) => {
        if (callback){
            callback(data.payload || data);
        }
    }, timeout);
}

function genMid(){
    let timestamp = Math.floor(Date.now() / 1000);
    return new Uint64LE(timestamp, this._midSeq++);
}

function genSalt(){
    let timestamp = Math.floor(Date.now() / 1000);
    return new Uint64LE(timestamp, this._saltSeq++);
}

function genSign(salt){
    return md5.call(this, this._pid + ':' + this._secretKey + ':' + salt).toUpperCase();
}

function md5(data){
    let hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest();
}

Object.setPrototypeOf(RTMClient.prototype, Emitter.prototype);
module.exports = RTMClient;