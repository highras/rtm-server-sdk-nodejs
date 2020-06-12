'use strict';

const fs = require('fs');
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;
const Emitter = require('events').EventEmitter;

const FPConfig = require('../fpnn/FPConfig');
const FPClient = require('../fpnn/FPClient');
const FPManager = require('../fpnn/FPManager');
const ErrorRecorder = require('../fpnn/ErrorRecorder');
const RTMConfig = require('./RTMConfig');
const RTMProcessor = require('./RTMProcessor');

class RTMClient {
    /**
     *
     * @param {object} options
     *
     * options:
     * {number} options.pid
     * {string} options.secret
     * {string} options.host
     * {numer} options.port
     * {bool} options.reconnect
     * {number} options.timeout
     * {bool} options.debug
     */
    constructor(options) {
        if (options.pid === undefined || options.pid <= 0) {
            console.log('[RTM] The \'pid\' Is Zero Or Negative!');
            return;
        }
        if (options.secret === undefined || !options.secret) {
            console.log('[RTM] The \'secret\' Is Null Or Empty!');
            return;
        }
        if (options.host === undefined || !options.host) {
            console.log('[RTM] The \'host\' Is Null Or Empty!');
            return;
        }
        if (options.port === undefined || options.port <= 0) {
            console.log('[RTM] The \'port\' Is Zero Or Negative!');
            return;
        }

        console.log('[RTM] rtm_sdk@' + RTMConfig.VERSION + ', fpnn_sdk@' + FPConfig.VERSION);

        this._pid = options.pid;
        this._secret = options.secret;
        this._host = options.host;
        this._port = options.port;
        this._timeout = options.timeout;
        this._reconnect = options.reconnect === undefined ? true : options.reconnect;
        this._debug = options.debug === undefined ? false : options.debug;
        this._msgOptions = {
            codec: msgpack.createCodec({
                int64: true
            })
        };
        this._isClose = false;
        this._secondListener = null;
        this._encryptInfo = null;
        this._delayCount = 0;
        this._delayTimestamp = 0;
        initProcessor.call(this);
    }

    get processor() {
        return this._processor;
    }

    destroy() {
        this._isClose = true;
        this._delayCount = 0;
        this._delayTimestamp = 0;
        if (this._secondListener) {
            FPManager.instance.removeSecond(this._secondListener);
            this._secondListener = null;
        }
        this.emit('close', !this._isClose && this._reconnect);
        let self = this;
        FPManager.instance.asyncTask(function (state) {
            self.removeAllListeners();
        }, null);

        if (this._processor) {
            this._processor.destroy();
            this._processor = null;
        }
        if (this._baseClient) {
            this._baseClient.close();
            this._baseClient = null;
        }
    }

    /**
     *
     * @param {Buffer/string}   peerPubData
     * @param {object}          options
     *
     * options:
     * {string}     options.curve
     * {number}     options.strength
     * {bool}       options.streamMode
     */
    connect(peerPubData, options) {
        if (!options) {
            options = {};
        }
        if (typeof peerPubData == 'string') {
            let self = this;
            fs.readFile(peerPubData, function (err, data) {
                if (err) {
                    self.connect(null, options);
                } else {
                    self.connect(data, options);
                }
            });
            return;
        }
        createBaseClient.call(this);
        if (this._baseClient) {
            if (!peerPubData) {
                this._encryptInfo = null;
                this._baseClient.connect(null, options);
                return;
            }
            let succ = this._baseClient.encryptor(options.curve, peerPubData, options.streamMode, options.strength);
            if (succ) {
                this._encryptInfo = new RTMClient.EncryptInfo(peerPubData, options);
                this._baseClient.connect(function (fpEncryptor) {
                    return msgpack.encode({
                        publicKey: fpEncryptor.pubKey,
                        streamMode: fpEncryptor.streamMode,
                        bits: fpEncryptor.strength
                    });
                });
            } else {
                this._encryptInfo = null;
                this._baseClient.connect();
            }
        }
    }

    /**
     *
     * ServerGate (1a)
     *
     * @param {Int64BE}     uid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {Error}       err
     * @param {object(token:string)} payload
     */
    getToken(uid, timeout, callback) {
        let cmd = 'gettoken';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (1b)
     *
     * @param {Int64BE}     uid
     * @param {string}      ce
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {Error}       err
     * @param {object}      data
     */
    kickout(uid, ce, timeout, callback) {
        let cmd = 'kickout';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        if (ce !== undefined) {
            payload.ce = ce;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (1c)
     *
     * @param {Int64BE}     uid
     * @param {string}      apptype
     * @param {string}      devicetoken
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {Error}       err
     * @param {object}      data
     */
    addDevice(uid, apptype, devicetoken, timeout, callback) {
        let cmd = 'adddevice';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            apptype: apptype,
            devicetoken: devicetoken
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (1d)
     *
     * @param {Int64BE}     uid
     * @param {string}      devicetoken
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {Error}       err
     * @param {object}      data
     */
    removeDevice(uid, devicetoken, timeout, callback) {
        let cmd = 'removedevice';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            devicetoken: devicetoken
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (1e)
     *
     * @param {Int64BE}     uid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {Error}       err
     * @param {object}      data
     */
    removeToken(uid, timeout, callback) {
        let cmd = 'removetoken';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (2a)
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     to
     * @param {number}      mtype
     * @param {string}      msg
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE)}   data
     */
    sendMessage(from, to, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMClient.MidGenerator.gen();
        }
        let cmd = 'sendmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mtype: mtype,
            from: from,
            to: to,
            mid: mid,
            msg: msg,
            attrs: attrs
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback({
                    mid: payload.mid,
                    error: err
                }, null);
                return;
            }
            if (data.mtime !== undefined) {
                data.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, {
                mid: payload.mid,
                payload: data
            });
        }, timeout);
    }

    /**
     *
     * ServerGate (2b)
     *
     * @param {Int64BE}         from
     * @param {array(Int64BE)}  tos
     * @param {number}          mtype
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendMessages(from, tos, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMClient.MidGenerator.gen();
        }
        let cmd = 'sendmsgs';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mtype: mtype,
            from: from,
            tos: tos,
            mid: mid,
            msg: msg,
            attrs: attrs
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback({
                    mid: payload.mid,
                    error: err
                }, null);
                return;
            }
            if (data.mtime !== undefined) {
                data.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, {
                mid: payload.mid,
                payload: data
            });
        }, timeout);
    }

    /**
     *
     * ServerGate (2c)
     *
     * @param {Int64BE}         from
     * @param {Int64BE}         gid
     * @param {number}          mtype
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendGroupMessage(from, gid, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMClient.MidGenerator.gen();
        }
        let cmd = 'sendgroupmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mtype: mtype,
            from: from,
            gid: gid,
            mid: mid,
            msg: msg,
            attrs: attrs
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback({
                    mid: payload.mid,
                    error: err
                }, null);
                return;
            }
            if (data.mtime !== undefined) {
                data.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, {
                mid: payload.mid,
                payload: data
            });
        }, timeout);
    }

    /**
     *
     * ServerGate (2d)
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     rid
     * @param {number}      mtype
     * @param {string}      msg
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendRoomMessage(from, rid, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMClient.MidGenerator.gen();
        }
        let cmd = 'sendroommsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mtype: mtype,
            from: from,
            rid: rid,
            mid: mid,
            msg: msg,
            attrs: attrs
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback({
                    mid: payload.mid,
                    error: err
                }, null);
                return;
            }
            if (data.mtime !== undefined) {
                data.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, {
                mid: payload.mid,
                payload: data
            });
        }, timeout);
    }

    /**
     *
     * ServerGate (2e)
     *
     * @param {Int64BE}         from
     * @param {number}          mtype
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    broadcastMessage(from, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMClient.MidGenerator.gen();
        }
        let cmd = 'broadcastmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mtype: mtype,
            from: from,
            mid: mid,
            msg: msg,
            attrs: attrs
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback({
                    mid: payload.mid,
                    error: err
                }, null);
                return;
            }
            if (data.mtime !== undefined) {
                data.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, {
                mid: payload.mid,
                payload: data
            });
        }, timeout);
    }

    /**
     *
     * ServerGate (2f)
     *
     * @param {Int64BE}         gid
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {array(number)}   mtypes
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(GroupMsg))}    data
     *
     * <GroupMsg>
     * @param {Int64BE}     GroupMsg.id
     * @param {Int64BE}     GroupMsg.from
     * @param {number}      GroupMsg.mtype
     * @param {Int64BE}     GroupMsg.mid
     * @param {string}      GroupMsg.msg
     * @param {string}      GroupMsg.attrs
     * @param {Int64BE}     GroupMsg.mtime
     */
    getGroupMessage(uid, gid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getgroupmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid,
            desc: desc,
            num: num,
            uid: uid
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
        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs) {
                msgs.forEach(function (item, index) {
                    let groupMsg = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                    if (groupMsg.hasOwnProperty('deleted')) {
                        delete groupMsg.deleted;
                    }
                    if (groupMsg.mtype == RTMConfig.CHAT_TYPE.audio) {
                        if (groupMsg.hasOwnProperty('msg') && groupMsg.msg instanceof String) {
                            let buf = Buffer.from(groupMsg.msg, 'utf8');
                            groupMsg.msg = buf;
                        }
                    }
                    msgs[index] = groupMsg;
                });
            }
            callback && callback(null, data);
        }, timeout);
    }

    /**
     *
     * ServerGate (2g)
     *
     * @param {Int64BE}         rid
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {array(number)}   mtypes
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(RoomMsg))}     data
     *
     * <RoomMsg>
     * @param {Int64BE}     RoomMsg.id
     * @param {Int64BE}     RoomMsg.from
     * @param {number}      RoomMsg.mtype
     * @param {Int64BE}     RoomMsg.mid
     * @param {string}      RoomMsg.msg
     * @param {string}      RoomMsg.attrs
     * @param {Int64BE}     RoomMsg.mtime
     */
    getRoomMessage(uid, rid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getroommsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid,
            desc: desc,
            num: num,
            uid: uid
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
        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs) {
                msgs.forEach(function (item, index) {
                    let roomMsg = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                    if (roomMsg.hasOwnProperty('deleted')) {
                        delete roomMsg.deleted;
                    }
                    if (roomMsg.mtype == RTMConfig.CHAT_TYPE.audio) {
                        if (roomMsg.hasOwnProperty('msg') && roomMsg.msg instanceof String) {
                            let buf = Buffer.from(roomMsg.msg, 'utf8');
                            roomMsg.msg = buf;
                        }
                    }
                    msgs[index] = roomMsg;
                });
            }
            callback && callback(null, data);
        }, timeout);
    }

    /**
     *
     * ServerGate (2h)
     *
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {array(number)}   mtypes
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(BroadcastMsg))}    data
     *
     * <BroadcastMsg>
     * @param {Int64BE}     BroadcastMsg.id
     * @param {Int64BE}     BroadcastMsg.from
     * @param {number}      BroadcastMsg.mtype
     * @param {Int64BE}     BroadcastMsg.mid
     * @param {string}      BroadcastMsg.msg
     * @param {string}      BroadcastMsg.attrs
     * @param {Int64BE}     BroadcastMsg.mtime
     */
    getBroadcastMessage(uid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getbroadcastmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            desc: desc,
            num: num,
            uid: uid
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
        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs) {
                msgs.forEach(function (item, index) {
                    let broadcastMsg = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                    if (broadcastMsg.hasOwnProperty('deleted')) {
                        delete broadcastMsg.deleted;
                    }
                    if (broadcastMsg.mtype == RTMConfig.CHAT_TYPE.audio) {
                        if (broadcastMsg.hasOwnProperty('msg') && broadcastMsg.msg instanceof String) {
                            let buf = Buffer.from(broadcastMsg.msg, 'utf8');
                            broadcastMsg.msg = buf;
                        }
                    }
                    msgs[index] = broadcastMsg;
                });
            }
            callback && callback(null, data);
        }, timeout);
    }

    /**
     *
     * ServerGate (2i)
     *
     * @param {Int64BE}         uid
     * @param {Int64BE}         ouid
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {array(number)}   mtypes
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(P2PMsg))}  data
     *
     * <P2PMsg>
     * @param {Int64BE}     P2PMsg.id
     * @param {number}      P2PMsg.direction
     * @param {number}      P2PMsg.mtype
     * @param {Int64BE}     P2PMsg.mid
     * @param {string}      P2PMsg.msg
     * @param {string}      P2PMsg.attrs
     * @param {Int64BE}     P2PMsg.mtime
     */
    getP2PMessage(uid, ouid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getp2pmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
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
        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs) {
                msgs.forEach(function (item, index) {
                    let p2pMsg = {
                        id: new Int64BE(item[0]),
                        direction: Number(item[1]),
                        mtype: Number(item[2]),
                        mid: new Int64BE(item[3]),
                        deleted: item[4],
                        msg: item[5],
                        attrs: item[6],
                        mtime: new Int64BE(item[7])
                    };
                    if (p2pMsg.hasOwnProperty('deleted')) {
                        delete p2pMsg.deleted;
                    }
                    if (p2pMsg.mtype == RTMConfig.CHAT_TYPE.audio) {
                        if (p2pMsg.hasOwnProperty('msg') && p2pMsg.msg instanceof String) {
                            let buf = Buffer.from(p2pMsg.msg, 'utf8');
                            p2pMsg.msg = buf;
                        }
                    }
                    msgs[index] = p2pMsg;
                });
            }
            callback && callback(null, data);
        }, timeout);
    }

    /**
     *
     * ServerGate (2j)
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         to 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteMessage(mid, from, to, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mid: mid,
            from: from,
            xid: to,
            type: 1
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (2j)
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         xid
     * @param {number}          type 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    getMessage(mid, from, xid, type, timeout, callback) {
        let cmd = 'getmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mid: mid,
            from: from,
            xid: xid,
            type: type
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (2j)
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         xid
     * @param {number}          type 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    getMessage(mid, from, xid, type, timeout, callback) {
        let cmd = 'getmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mid: mid,
            from: from,
            xid: xid,
            type: type
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (2j)
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         xid
     * @param {number}          type 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    getChat(mid, from, xid, type, timeout, callback) {
        this.getMessage(mid, from, xid, type, timeout, callback);
    }

    /**
     *
     * ServerGate (2j')
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         gid 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteGroupMessage(mid, from, gid, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mid: mid,
            from: from,
            xid: gid,
            type: 2
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (2j'')
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         rid 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteRoomMessage(mid, from, rid, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mid: mid,
            from: from,
            xid: rid,
            type: 3
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (2j''')
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteBroadcastMessage(mid, from, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            mid: mid,
            from: from,
            xid: 0,
            type: 4
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (3a)
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     to
     * @param {string}      msg
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE)}   data
     */
    sendChat(from, to, msg, attrs, mid, timeout, callback) {
        this.sendMessage(from, to, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3a')
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     to
     * @param {Buffer}      audio
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE)}   data
     */
    sendAudio(from, to, audio, attrs, mid, timeout, callback) {
        this.sendMessage(from, to, RTMConfig.CHAT_TYPE.audio, audio, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3a'')
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     to
     * @param {string}      msg
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE)}   data
     */
    sendCmd(from, to, msg, attrs, mid, timeout, callback) {
        this.sendMessage(from, to, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3b)
     *
     * @param {Int64BE}         from
     * @param {array(Int64BE)}  tos
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendChats(from, tos, msg, attrs, mid, timeout, callback) {
        this.sendMessages(from, tos, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3b')
     *
     * @param {Int64BE}         from
     * @param {array(Int64BE)}  tos
     * @param {Buffer}          audio
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendAudios(from, tos, audio, attrs, mid, timeout, callback) {
        this.sendMessages(from, tos, RTMConfig.CHAT_TYPE.audio, audio, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3b'')
     *
     * @param {Int64BE}         from
     * @param {array(Int64BE)}  tos
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendCmds(from, tos, msg, attrs, mid, timeout, callback) {
        this.sendMessages(from, tos, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3c)
     *
     * @param {Int64BE}         from
     * @param {Int64BE}         gid
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendGroupChat(from, gid, msg, attrs, mid, timeout, callback) {
        this.sendGroupMessage(from, gid, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3c')
     *
     * @param {Int64BE}         from
     * @param {Int64BE}         gid
     * @param {Buffer}          audio
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendGroupAudio(from, gid, audio, attrs, mid, timeout, callback) {
        this.sendGroupMessage(from, gid, RTMConfig.CHAT_TYPE.audio, audio, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3c'')
     *
     * @param {Int64BE}         from
     * @param {Int64BE}         gid
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendGroupCmd(from, gid, msg, attrs, mid, timeout, callback) {
        this.sendGroupMessage(from, gid, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3d)
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     rid
     * @param {string}      msg
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendRoomChat(from, rid, msg, attrs, mid, timeout, callback) {
        this.sendRoomMessage(from, rid, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3d')
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     rid
     * @param {Buffer}      audio
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendRoomAudio(from, rid, audio, attrs, mid, timeout, callback) {
        this.sendRoomMessage(from, rid, RTMConfig.CHAT_TYPE.audio, audio, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3d'')
     *
     * @param {Int64BE}     from
     * @param {Int64BE}     rid
     * @param {string}      msg
     * @param {string}      attrs
     * @param {Int64BE}     mid
     * @param {number}      timeout
     * @param {function}    callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendRoomCmd(from, rid, msg, attrs, mid, timeout, callback) {
        this.sendRoomMessage(from, rid, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3e)
     *
     * @param {Int64BE}         from
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    broadcastChat(from, msg, attrs, mid, timeout, callback) {
        this.broadcastMessage(from, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3e')
     *
     * @param {Int64BE}         from
     * @param {Buffer}          audio
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    broadcastAudio(from, audio, attrs, mid, timeout, callback) {
        this.broadcastMessage(from, RTMConfig.CHAT_TYPE.audio, audio, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3e'')
     *
     * @param {Int64BE}         from
     * @param {string}          msg
     * @param {string}          attrs
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {object(mid:Int64BE,error:Error)}     err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    broadcastCmd(from, msg, attrs, mid, timeout, callback) {
        this.broadcastMessage(from, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    /**
     *
     * ServerGate (3f)
     *
     * @param {Int64BE}         gid
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(GroupMsg))}    data
     *
     * <GroupMsg>
     * @param {Int64BE}     GroupMsg.id
     * @param {Int64BE}     GroupMsg.from
     * @param {number}      GroupMsg.mtype
     * @param {Int64BE}     GroupMsg.mid
     * @param {string}      GroupMsg.msg
     * @param {string}      GroupMsg.attrs
     * @param {Int64BE}     GroupMsg.mtime
     */
    getGroupChat(uid, gid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getGroupMessage(uid, gid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    /**
     *
     * ServerGate (3g)
     *
     * @param {Int64BE}         rid
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(RoomMsg))}     data
     *
     * <RoomMsg>
     * @param {Int64BE}     RoomMsg.id
     * @param {Int64BE}     RoomMsg.from
     * @param {number}      RoomMsg.mtype
     * @param {Int64BE}     RoomMsg.mid
     * @param {string}      RoomMsg.msg
     * @param {string}      RoomMsg.attrs
     * @param {Int64BE}     RoomMsg.mtime
     */
    getRoomChat(uid, rid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getRoomMessage(uid, rid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    /**
     *
     * ServerGate (3h)
     *
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(BroadcastMsg))}    data
     *
     * <BroadcastMsg>
     * @param {Int64BE}     BroadcastMsg.id
     * @param {Int64BE}     BroadcastMsg.from
     * @param {number}      BroadcastMsg.mtype
     * @param {Int64BE}     BroadcastMsg.mid
     * @param {string}      BroadcastMsg.msg
     * @param {string}      BroadcastMsg.attrs
     * @param {Int64BE}     BroadcastMsg.mtime
     */
    getBroadcastChat(uid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getBroadcastMessage(uid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    /**
     *
     * ServerGate (3i)
     *
     * @param {Int64BE}         uid
     * @param {Int64BE}         ouid
     * @param {bool}            desc
     * @param {number}          num
     * @param {Int64BE}         begin
     * @param {Int64BE}         end
     * @param {Int64BE}         lastid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(P2PMsg))}  data
     *
     * <P2PMsg>
     * @param {Int64BE}     P2PMsg.id
     * @param {number}      P2PMsg.direction
     * @param {number}      P2PMsg.mtype
     * @param {Int64BE}     P2PMsg.mid
     * @param {string}      P2PMsg.msg
     * @param {string}      P2PMsg.attrs
     * @param {Int64BE}     P2PMsg.mtime
     */
    getP2PChat(uid, ouid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getP2PMessage(uid, ouid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    /**
     *
     * ServerGate (3j)
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         to 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteChat(mid, from, to, timeout, callback) {
        this.deleteMessage(mid, from, to, timeout, callback);
    }

    /**
     *
     * ServerGate (3j')
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         gid 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteGroupChat(mid, from, gid, timeout, callback) {
        this.deleteGroupMessage(mid, from, gid, timeout, callback);
    }

    /**
     *
     * ServerGate (3j'')
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {Int64BE}         rid 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteRoomChat(mid, from, rid, timeout, callback) {
        this.deleteRoomMessage(mid, from, rid, timeout, callback);
    }

    /**
     *
     * ServerGate (3j''')
     *
     * @param {Int64BE}         mid
     * @param {Int64BE}         from
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}           err
     * @param {object}          data
     */
    deleteBroadcastChat(mid, from, timeout, callback) {
        this.deleteBroadcastMessage(mid, from, timeout, callback);
    }

    /**
     *
     * ServerGate (3k)
     *
     * @param {string}          text
     * @param {string}          src
     * @param {string}          dst
     * @param {string}          type
     * @param {string}          profanity
     * @param {bool}            postProfanity
     * @param {number}          uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(source:string,target:string,sourceText:string,targetText:string)}  data
     */
    translate(text, src, dst, type, profanity, uid, timeout, callback) {
        let cmd = 'translate';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            text: text,
            dst: dst
        };
        if (src !== undefined) {
            payload.src = src;
        }
        if (type !== undefined) {
            payload.type = type;
        }
        if (profanity !== undefined) {
            payload.profanity = profanity;
        }
        if (uid !== undefined) {
            payload.uid = uid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (3i)
     *
     * @param {string}          text
     * @param {string}          action
     * @param {bool}            classify
     * @param {number}          uid
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(text:string, classification:list<string>)}  data
     */
    profanity(text, classify, uid, timeout, callback) {
        let cmd = 'profanity';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            text: text
        };
        if (classify !== undefined) {
            payload.classify = classify;
        }
        if (uid !== undefined) {
            payload.uid = uid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (3j)
     *
     * @param {Buffer}          audio
     * @param {string}          lang
     * @param {number}          uid
     * @param {number}          codec
     * @param {number}          srate
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(text:string,lang:string)}  data
     */
    transcribe(audio, uid, profanityFilter, timeout, callback) {
        let cmd = 'transcribe';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            audio: audio
        };
        if (uid !== undefined) {
            payload.uid = uid;
        }
        if (profanityFilter != undefined) {
            payload.profanityFilter = profanityFilter;
        }

        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (4a)
     *
     * @param {Int64BE}         from
     * @param {string}          cmd
     * @param {array<Int64BE>}  tos
     * @param {Int64BE}         to
     * @param {Int64BE}         rid
     * @param {Int64BE}         gid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object(token:string,endpoint:string)}   data
     */
    fileToken(from, cmd, tos, to, rid, gid, timeout, callback) {
        let options = {
            from: from,
            cmd: cmd
        };
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
        filetoken.call(this, options, timeout, callback);
    }

    /**
     *
     * ServerGate (5a)
     *
     * @param {array<Int64BE>}  uids
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {array<Int64BE>}  uids
     */
    getOnlineUsers(uids, timeout, callback) {
        let cmd = 'getonlineusers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uids: uids
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {
                let buids = [];
                uids.forEach(function (item, index) {
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
     * ServerGate (5b)
     *
     * @param {Int64BE}         uid
     * @param {number}          btime
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object}      data
     */
    addProjectBlack(uid, btime, timeout, callback) {
        let cmd = 'addprojectblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            btime: btime
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (5c)
     *
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object}      data
     */
    removeProjectBlack(uid, timeout, callback) {
        let cmd = 'removeprojectblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (5d)
     *
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object(ok:boolean)}  data
     */
    isProjectBlack(uid, timeout, callback) {
        let cmd = 'isprojectblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (5e)
     *
     * @param {Int64BE}         uid
     * @param {string}          oinfo
     * @param {string}          pinfo
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object}      data
     */
    setUserInfo(uid, oinfo, pinfo, timeout, callback) {
        let cmd = 'setuserinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        if (oinfo !== undefined) {
            payload.oinfo = oinfo;
        }
        if (pinfo !== undefined) {
            payload.pinfo = pinfo;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (5f)
     *
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object(oinfo:string,pinfo:string)}      data
     */
    getUserInfo(uid, timeout, callback) {
        let cmd = 'getuserinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (5g)
     *
     * @param {array(Int64BE)}  uids
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}       err
     * @param {object(string,string)}      data
     */
    getUserOpenInfo(uids, timeout, callback) {
        let cmd = 'getuseropeninfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uids: uids
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let info = data['info'];
            if (info) {
                callback && callback(null, info);
                return;
            }
            callback && callback(null, data);
        }, timeout);
    }

    /**
     *
     * ServerGate (6a)
     *
     * @param {Int64BE}         uid
     * @param {array<Int64BE>}  friends
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    addFriends(uid, friends, timeout, callback) {
        let cmd = 'addfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            friends: friends
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (6b)
     *
     * @param {Int64BE}         uid
     * @param {array<Int64BE>}  friends
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    deleteFriends(uid, friends, timeout, callback) {
        let cmd = 'delfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            friends: friends
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (6c)
     *
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {array<Int64BE>}  data
     */
    getFriends(uid, timeout, callback) {
        let cmd = 'getfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {
                let buids = [];
                uids.forEach(function (item, index) {
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
     * ServerGate (6d)
     *
     * @param {Int64BE}         uid
     * @param {Int64BE}         fuid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(ok:bool)} data
     */
    isFriend(uid, fuid, timeout, callback) {
        let cmd = 'isfriend';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            fuid: fuid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (6e)
     *
     * @param {Int64BE}         uid
     * @param {array<Int64BE>}  fuids
     * @param {function}        callback
     * @param {number}          timeout
     *
     * @callback
     * @param {Error}   err
     * @param {array<Int64BE>}  data
     */
    isFriends(uid, fuids, timeout, callback) {
        let cmd = 'isfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            fuids: fuids
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let fuids = data['fuids'];
            if (fuids) {
                let bfuids = [];
                fuids.forEach(function (item, index) {
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
     *
     * @param {Int64BE}         uid
     * @param {array<Int64BE>}  blacks
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    addBlacks(uid, blacks, timeout, callback) {
        let cmd = 'addblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            blacks: blacks
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     *
     * @param {Int64BE}         uid
     * @param {array<Int64BE>}  blacks
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    deleteBlacks(uid, blacks, timeout, callback) {
        let cmd = 'delblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            blacks: blacks
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     *
     * @param {Int64BE}         uid
     * @param {Int64BE}         buid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(ok:bool)} data
     */
    isBlack(uid, buid, timeout, callback) {
        let cmd = 'isblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            buid: buid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     *
     * @param {Int64BE}         uid
     * @param {array<Int64BE>}  buids
     * @param {function}        callback
     * @param {number}          timeout
     *
     * @callback
     * @param {Error}   err
     * @param {array<Int64BE>}  data
     */
    isBlacks(uid, buids, timeout, callback) {
        let cmd = 'isblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            buids: buids
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let buids = data['buids'];
            if (buids) {
                let bfuids = [];
                buids.forEach(function (item, index) {
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
     * ServerGate (6c)
     *
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {array<Int64BE>}  data
     */
    getBlacks(uid, timeout, callback) {
        let cmd = 'getblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {
                let buids = [];
                uids.forEach(function (item, index) {
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
     * ServerGate (7a)
     *
     * @param {Int64BE}         gid
     * @param {array<Int64BE>}  uids
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    addGroupMembers(gid, uids, timeout, callback) {
        let cmd = 'addgroupmembers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid,
            uids: uids
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7b)
     *
     * @param {Int64BE}         gid
     * @param {array<Int64BE>}  uids
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    deleteGroupMembers(gid, uids, timeout, callback) {
        let cmd = 'delgroupmembers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid,
            uids: uids
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7c)
     *
     * @param {Int64BE}         gid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    deleteGroup(gid, timeout, callback) {
        let cmd = 'delgroup';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7d)
     *
     * @param {Int64BE}         gid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {array<Int64BE>}  data
     */
    getGroupMembers(gid, timeout, callback) {
        let cmd = 'getgroupmembers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids) {
                let buids = [];
                uids.forEach(function (item, index) {
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
     * ServerGate (7e)
     *
     * @param {Int64BE}         gid
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(ok:bool))}    data
     */
    isGroupMember(gid, uid, timeout, callback) {
        let cmd = 'isgroupmember';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7f)
     *
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {array<Int64BE>}  data
     */
    getUserGroups(uid, timeout, callback) {
        let cmd = 'getusergroups';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let gids = data['gids'];
            if (gids) {
                let bgids = [];
                gids.forEach(function (item, index) {
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
     * ServerGate (7g)
     *
     * @param {Int64BE}         gid
     * @param {Int64BE}         uid
     * @param {number}          btime
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   errorr
     * @param {object}  data
     */
    addGroupBan(gid, uid, btime, timeout, callback) {
        let cmd = 'addgroupban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid,
            uid: uid,
            btime: btime
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7h)
     *
     * @param {Int64BE}         gid
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    removeGroupBan(gid, uid, timeout, callback) {
        let cmd = 'removegroupban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7i)
     *
     * @param {Int64BE}         gid
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(ok:bool)}    data
     */
    isBanOfGroup(gid, uid, timeout, callback) {
        let cmd = 'isbanofgroup';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7j)
     *
     * @param {Int64BE}         gid
     * @param {string}          oinfo
     * @param {string}          pinfo
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    setGroupInfo(gid, oinfo, pinfo, timeout, callback) {
        let cmd = 'setgroupinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid
        };
        if (oinfo !== undefined) {
            payload.oinfo = oinfo;
        }
        if (pinfo !== undefined) {
            payload.pinfo = pinfo;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (7k)
     *
     * @param {Int64BE}         gid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(oinfo:string,pinfo:string)}  data
     */
    getGroupInfo(gid, timeout, callback) {
        let cmd = 'getgroupinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            gid: gid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (8a)
     *
     * @param {Int64BE}         rid
     * @param {Int64BE}         uid
     * @param {number}          btime
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    addRoomBan(rid, uid, btime, timeout, callback) {
        let cmd = 'addroomban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid,
            uid: uid,
            btime: btime
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (8b)
     *
     * @param {Int64BE}         rid
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    removeRoomBan(rid, uid, timeout, callback) {
        let cmd = 'removeroomban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (8c)
     *
     * @param {Int64BE}         rid
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(ok:bool)}    data
     */
    isBanOfRoom(rid, uid, timeout, callback) {
        let cmd = 'isbanofroom';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (8d)
     *
     * @param {Int64BE}         rid
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    addRoomMember(rid, uid, timeout, callback) {
        let cmd = 'addroommember';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (8e)
     *
     * @param {Int64BE}         rid
     * @param {Int64BE}         uid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    deleteRoomMember(rid, uid, timeout, callback) {
        let cmd = 'delroommember';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid,
            uid: uid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (8f)
     *
     * @param {Int64BE}         rid
     * @param {string}          oinfo
     * @param {string}          pinfo
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    setRoomInfo(rid, oinfo, pinfo, timeout, callback) {
        let cmd = 'setroominfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid
        };
        if (oinfo !== undefined) {
            payload.oinfo = oinfo;
        }
        if (pinfo !== undefined) {
            payload.pinfo = pinfo;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (8g)
     *
     * @param {Int64BE}         rid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(oinfo:string,pinfo:string)}  data
     */
    getRoomInfo(rid, timeout, callback) {
        let cmd = 'getroominfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (9a)
     *
     * @param {array<Int64BE>}  opts.gids
     * @param {array<Int64BE>}  opts.rids
     * @param {array<Int64BE>}  opts.uids
     * @param {array<string>}   opts.events
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    addEvtListener(opts, timeout, callback) {
        let cmd = 'addlisten';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid
        };
        if (opts.gids !== undefined) {
            payload.gids = opts.gids;
        }
        if (opts.rids !== undefined) {
            payload.rids = opts.rids;
        }
        if (opts.uids !== undefined) {
            payload.uids = opts.uids;
        }
        if (opts.events !== undefined) {
            payload.events = opts.events;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (9b)
     *
     * @param {array<Int64BE>}  opts.gids
     * @param {array<Int64BE>}  opts.rids
     * @param {array<Int64BE>}  opts.uids
     * @param {array<string>}   opts.events
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    removeEvtListener(opts, timeout, callback) {
        let cmd = 'removelisten';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid
        };
        if (opts.gids !== undefined) {
            payload.gids = opts.gids;
        }
        if (opts.rids !== undefined) {
            payload.rids = opts.rids;
        }
        if (opts.uids !== undefined) {
            payload.uids = opts.uids;
        }
        if (opts.events !== undefined) {
            payload.events = opts.events;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (9c)
     *
     * @param {bool}            opts.p2p
     * @param {bool}            opts.group
     * @param {bool}            opts.room
     * @param {bool}            opts.ev
     * OR  
     * @param {array<Int64BE>}  opts.gids
     * @param {array<Int64BE>}  opts.rids
     * @param {array<Int64BE>}  opts.uids
     * @param {array<string>}   opts.events
     * 
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    setEvtListener(opts, timeout, callback) {
        let cmd = 'setlisten';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid
        };
        if (opts.p2p !== undefined && typeof opts.p2p == 'boolean') {
            payload.p2p = opts.p2p;
        } else {
            if (opts.uids !== undefined) {
                payload.uids = opts.uids;
            }
        }
        if (opts.group !== undefined && typeof opts.group == 'boolean') {
            payload.group = opts.group;
        } else {
            if (opts.gids !== undefined) {
                payload.gids = opts.gids;
            }
        }
        if (opts.room !== undefined && typeof opts.room == 'boolean') {
            payload.room = opts.room;
        } else {
            if (opts.rids !== undefined) {
                payload.rids = opts.rids;
            }
        }
        if (opts.ev !== undefined && typeof opts.ev == 'boolean') {
            payload.ev = opts.ev;
        } else {
            if (opts.events !== undefined) {
                payload.events = opts.events;
            }
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (10a)
     *
     * @param {Int64BE}         uid
     * @param {string}          key
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(val:string)}  data
     */
    dataGet(uid, key, timeout, callback) {
        let cmd = 'dataget';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            key: key
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (10b)
     *
     * @param {Int64BE}         uid
     * @param {string}          key
     * @param {string}          val
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    dataSet(uid, key, val, timeout, callback) {
        let cmd = 'dataset';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            key: key,
            val: val
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * ServerGate (10c)
     *
     * @param {Int64BE}         uid
     * @param {string}          key
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object}  data
     */
    dataDelete(uid, key, timeout, callback) {
        let cmd = 'datadel';
        let ts = FPManager.instance.timestamp;
        let salt = RTMClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            key: key
        };
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    /**
     *
     * fileGate (1)
     *
     * @param {Int64BE}         from
     * @param {Int64BE}         to
     * @param {number}          mtype
     * @param {Buffer}          fileBytes
     * @param {string}          fileExt
     * @param {string}          fileName
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {Error}   err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendFile(from, to, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new Error('empty file bytes!'));
            return;
        }

        let options = {
            cmd: 'sendfile',
            from: from,
            to: to,
            mtype: mtype,
            file: fileBytes,
            ext: fileExt,
            filename: fileName
        };
        fileSendProcess.call(this, options, mid, timeout, callback);
    }

    /**
     *
     * filegate (2)
     *
     * @param {Int64BE}         from
     * @param {array<Int64BE>}  tos
     * @param {number}          mtype
     * @param {Buffer}          fileBytes
     * @param {string}          fileExt
     * @param {string}          fileName
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {error}   err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendFiles(from, tos, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new Error('empty file bytes!'));
            return;
        }

        let options = {
            cmd: 'sendfiles',
            from: from,
            tos: tos,
            mtype: mtype,
            file: fileBytes,
            ext: fileExt,
            filename: fileName
        };
        fileSendProcess.call(this, options, mid, timeout, callback);
    }

    /**
     *
     * filegate (3)
     *
     * @param {Int64BE}         from
     * @param {Int64BE}         gid
     * @param {number}          mtype
     * @param {Buffer}          fileBytes
     * @param {string}          fileExt
     * @param {string}          fileName
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {error}   err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendGroupFile(from, gid, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new Error('empty file bytes!'));
            return;
        }

        let options = {
            cmd: 'sendgroupfile',
            from: from,
            gid: gid,
            mtype: mtype,
            file: fileBytes,
            ext: fileExt,
            filename: fileName
        };
        fileSendProcess.call(this, options, mid, timeout, callback);
    }

    /**
     *
     * filegate (4)
     *
     * @param {Int64BE}         from
     * @param {Int64BE}         rid
     * @param {number}          mtype
     * @param {Buffer}          fileBytes
     * @param {string}          fileExt
     * @param {string}          fileName
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {error}   err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    sendRoomFile(from, rid, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new Error('empty file bytes!'));
            return;
        }

        let options = {
            cmd: 'sendroomfile',
            from: from,
            rid: rid,
            mtype: mtype,
            file: fileBytes,
            ext: fileExt,
            filename: fileName
        };
        fileSendProcess.call(this, options, mid, timeout, callback);
    }

    /**
     *
     * filegate (5)
     *
     * @param {Int64BE}         from
     * @param {number}          mtype
     * @param {Buffer}          fileBytes
     * @param {string}          fileExt
     * @param {string}          fileName
     * @param {Int64BE}         mid
     * @param {number}          timeout
     * @param {function}        callback
     *
     * @callback
     * @param {error}   err
     * @param {object(mid:Int64BE,payload:object(mtime:Int64BE))}   data
     */
    broadcastFile(from, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new Error('empty file bytes!'));
            return;
        }

        let options = {
            cmd: 'broadcastfile',
            from: from,
            mtype: mtype,
            file: fileBytes,
            ext: fileExt,
            filename: fileName
        };
        fileSendProcess.call(this, options, mid, timeout, callback);
    }
}

function initProcessor() {
    this._processor = new RTMProcessor(this._msgOptions);
    let self = this;
    this._secondListener = function (timestamp) {
        onSecond.call(self, timestamp);
    };
    FPManager.instance.addSecond(this._secondListener);
    ErrorRecorder.instance.recorder = new RTMClient.RTMErrorRecorder(function (err) {
        self.emit('err', err);
    }, this._debug);
}

function onSecond(timestamp) {
    let lastPingTimestamp = 0;
    if (this._processor) {
        lastPingTimestamp = this._processor.pingTimestamp;
    }
    if (lastPingTimestamp > 0 && timestamp - lastPingTimestamp > RTMConfig.RECV_PING_TIMEOUT) {
        if (this._baseClient != null && this._baseClient.isOpen) {
            this._baseClient.close(new Error("ping timeout"));
        }
    }
    delayConnect.call(this, timestamp);
}

function createBaseClient() {
    if (this._baseClient == null) {
        this._isClose = false;
        let options = {
            host: this._host,
            port: this._port,
            connectionTimeout: this._timeout
        };
        let self = this;
        options.onConnect = function () {
            onConnect.call(self);
        };
        options.onClose = function () {
            onClose.call(self);
        };
        options.onError = function (err) {
            onError.call(self, err);
        };
        this._baseClient = new FPClient(options);
        this._baseClient.processor = this._processor;
    }
}

function onConnect() {
    this._delayCount = 0;
    this.emit('connect');
}

function onClose() {
    if (this._baseClient) {
        this._baseClient = null;
    }
    this.emit('close', !this._isClose && this._reconnect);
    reconnect.call(this);
}

function onError(err) {
    ErrorRecorder.instance.recordError(err);
}

function connect(info) {
    if (!info) {
        this.connect();
    } else {
        this.connect(info.pubBytes, info.options);
    }
}

function reconnect() {
    if (!this._reconnect) {
        return;
    }
    if (this._isClose) {
        return;
    }
    if (this._processor) {
        this._processor.clearPingTimestamp();
    }
    if (++this._delayCount >= RTMConfig.RECONN_COUNT_ONCE) {
        this.connect(this._encryptInfo);
        return;
    }
    this._delayTimestamp = FPManager.instance.milliTimestamp;
}

function delayConnect(timestamp) {
    if (this._delayTimestamp == 0) {
        return;
    }
    if (timestamp - this._delayTimestamp < RTMConfig.CONNCT_INTERVAL) {
        return;
    }
    this._delayCount = 0;
    this._delayTimestamp = 0;
    this.connect(this._encryptInfo);
}

function sendQuest(client, cmd, payload, callback, timeout) {
    if (!client) {
        callback && callback(new Error('client has been destroyed!'), null);
        return;
    }

    let options = {
        flag: 1,
        method: cmd,
        payload: msgpack.encode(payload, this._msgOptions)
    };

    let self = this;
    client.sendQuest(options, function (data) {
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

function isException(isAnswerErr, data) {
    if (!data) {
        return new Error('data is null!');
    }
    if (data instanceof Error) {
        return data;
    }
    if (isAnswerErr) {
        if (data.hasOwnProperty('code') && data.hasOwnProperty('ex')) {
            let sb = [];
            sb.push('code: ');
            sb.push(data.code);
            sb.push(', ex: ');
            sb.push(data.ex);
            return new Error(sb.join(''));
        }
    }
    return null;
}

function fileSendProcess(ops, mid, timeout, callback) {
    if (!mid || mid.toString() == '0') {
        mid = RTMClient.MidGenerator.gen();
    }
    let payload = {};
    if (ops.hasOwnProperty('cmd')) {
        payload.cmd = ops.cmd;
    }
    if (ops.hasOwnProperty('from')) {
        payload.from = ops.from;
    }
    if (ops.hasOwnProperty('tos')) {
        payload.tos = ops.tos;
    }
    if (ops.hasOwnProperty('to')) {
        payload.to = ops.to;
    }
    if (ops.hasOwnProperty('rid')) {
        payload.rid = ops.rid;
    }
    if (ops.hasOwnProperty('gid')) {
        payload.gid = ops.gid;
    }
    let self = this;
    filetoken.call(this, payload, timeout, function (err, data) {
        if (err) {
            callback && callback({
                mid: mid,
                error: err
            }, null);
            return;
        }
        if (!data) {
            callback && callback({
                mid: mid,
                error: new Error('file token error')
            }, null);
            return;
        }

        let token = null;
        if (data.hasOwnProperty('token')) {
            token = data.token;
        }
        let endpoint = null;
        if (data.hasOwnProperty('endpoint')) {
            endpoint = data.endpoint;
        }
        if (!token) {
            callback && callback({
                mid: mid,
                error: new Error('file token is null or empty')
            }, null);
            return;
        }
        if (!endpoint) {
            callback && callback({
                mid: mid,
                error: new Error('file endpoint is null or empty')
            }, null);
            return;
        }

        let ipport = endpoint.split(':');
        let fileMd5 = FPManager.instance.md5(ops.file).toLowerCase();
        let sign = FPManager.instance.md5(fileMd5 + ':' + token).toLowerCase();

        let options = {
            host: ipport[0],
            port: +ipport[1],
            connectionTimeout: timeout
        };
        options.onConnect = function () {
            ops.token = token;
            ops.sign = sign;
            sendfile.call(self, fileClient, ops, mid, timeout, callback);
        };
        options.onError = function (err) {
            onError.call(self, err);
        };
        let fileClient = new FPClient(options);
        fileClient.connect();
    });
}

function filetoken(ops, timeout, callback) {
    let cmd = 'filetoken';
    let ts = FPManager.instance.timestamp;
    let salt = RTMClient.MidGenerator.gen();
    let sign = genSign.call(this, salt, cmd, ts);

    let payload = {
        ts: ts,
        salt: salt,
        sign: sign,
        pid: this._pid
    };
    for (let key in ops) {
        if (key == 'mtype') {
            continue;
        }
        payload[key] = ops[key];
    }
    sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
}

function sendfile(fileClient, ops, mid, timeout, callback) {
    if (ops.cmd === undefined) {
        callback && callback(new Error('wrong cmd!'));
        return;
    }

    let payload = {
        pid: this._pid,
        mid: mid
    };
    if (ops.mtype !== undefined) {
        payload.mtype = ops.mtype;
    }
    if (ops.from !== undefined) {
        payload.from = ops.from;
    }
    if (ops.tos !== undefined) {
        payload.tos = ops.tos;
    }
    if (ops.to !== undefined) {
        payload.to = ops.to;
    }
    if (ops.rid !== undefined) {
        payload.rid = ops.rid;
    }
    if (ops.gid !== undefined) {
        payload.gid = ops.gid;
    }
    if (ops.token !== undefined) {
        payload.token = ops.token;
    }
    if (ops.file !== undefined) {
        payload.file = ops.file;
    }

    let attrs = {};
    if (ops.sign) {
        attrs.sign = ops.sign;
    }
    if (ops.ext) {
        attrs.ext = ops.ext;
    }
    payload.attrs = JSON.stringify(attrs);
    sendQuest.call(this, fileClient, ops.cmd, payload, function (err, data) {
        fileClient.close();
        if (err) {
            callback && callback({
                mid: payload.mid,
                error: err
            }, null);
            return;
        }
        if (data.mtime !== undefined) {
            data.mtime = new Int64BE(data.mtime);
        }
        callback && callback(null, {
            mid: payload.mid,
            payload: data
        });
    }, timeout);
}

function genSign(salt, cmd, ts) {
    let sb = [];
    sb.push(this._pid);
    sb.push(':');
    sb.push(this._secret);
    sb.push(':');
    sb.push(salt.toString());
    sb.push(':');
    sb.push(cmd);
    sb.push(':');
    sb.push(ts);
    return FPManager.instance.md5(sb.join('')).toUpperCase();
}

let midGeneratorCount = 0;
let midGeneratorStrBuilder = [];

RTMClient.MidGenerator = class {
    static gen() {
        let count = midGeneratorCount;
        let sb = midGeneratorStrBuilder;

        if (++count > 999) {
            count = 1;
        }

        midGeneratorCount = count;
        sb.length = 0;
        sb.push(FPManager.instance.milliTimestamp);

        if (count < 100) {
            sb.push('0');
        }
        if (count < 10) {
            sb.push('0');
        }
        sb.push(count);
        return new Int64BE(sb.join(''));
    }
};

RTMClient.RTMRegistration = class {
    static register() {
        FPManager.instance;
    }
};

RTMClient.RTMErrorRecorder = class {
    constructor(errFunc, debug) {
        this._debug = debug;
        this._errFunc = errFunc;
    }

    recordError(err) {
        if (this._debug) {
            console.error(err);
        }
        this._errFunc && this._errFunc(err);
    }
};

RTMClient.EncryptInfo = class {
    constructor(pubBytes, options) {
        this._pubBytes = pubBytes;
        this._options = options;
    }

    get pubBytes() {
        return this._pubBytes;
    }
    get options() {
        return this._options;
    }
};

Object.setPrototypeOf(RTMClient.prototype, Emitter.prototype);
module.exports = RTMClient;

