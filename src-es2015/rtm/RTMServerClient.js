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
const FPError = require('../fpnn/FPError');

class RTMServerClient {
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

        this._listenAllP2P = false;
        this._listenAllGroup = false;
        this._listenAllRoom = false;
        this._listenAllEv = false;
        this._listenP2P = new Set([]);
        this._listenGroup = new Set([]);
        this._listenRoom = new Set([]);
        this._listenEv = new Set([]);

        //console.log('[RTM] rtm_sdk@' + RTMConfig.VERSION + ', fpnn_sdk@' + FPConfig.VERSION);

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
        this._fileGateDict = {};
        this._regressiveStrategy = {
            startConnectFailedCount: 5,
            maxIntervalSeconds: 120,
            linearRegressiveCount: 5,
            firstIntervalSeconds: 2
        };
        this._isClose = false;
        this._secondListener = null;
        this._encryptInfo = null;
        this._delayCount = 0;
        this._delayTimestamp = 0;
        this._reconnectCount = 0;
        this._isReconnect = false;
        this._reconnectInterval = 0;
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
                this._encryptInfo = new RTMServerClient.EncryptInfo(peerPubData, options);
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

    setRegressiveStrategy(strategy) {
        this._regressiveStrategy.startConnectFailedCount = strategy.startConnectFailedCount || 5;
        this._regressiveStrategy.maxIntervalSeconds = strategy.maxIntervalSeconds || 120;
        this._regressiveStrategy.linearRegressiveCount = strategy.linearRegressiveCount || 5;
        this._regressiveStrategy.firstIntervalSeconds = strategy.firstIntervalSeconds || 2;
    }

    getToken(uid, timeout, callback) {
        let cmd = 'gettoken';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    kickout(uid, timeout, callback) {
        let cmd = 'kickout';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addDevice(uid, apptype, devicetoken, timeout, callback) {
        let cmd = 'adddevice';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    removeDevice(uid, devicetoken, timeout, callback) {
        let cmd = 'removedevice';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    removeToken(uid, timeout, callback) {
        let cmd = 'removetoken';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    sendMessage(from, to, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMServerClient.MidGenerator.gen();
        }
        let cmd = 'sendmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
                callback && callback(err, null);
                return;
            }
            var answer = { mid: payload.mid };
            if (data.mtime !== undefined) {
                answer.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, answer);
        }, timeout);
    }

    sendMessages(from, tos, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMServerClient.MidGenerator.gen();
        }
        let cmd = 'sendmsgs';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
                callback && callback(err, null);
                return;
            }
            var answer = { mid: payload.mid };
            if (data.mtime !== undefined) {
                answer.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, answer);
        }, timeout);
    }

    sendGroupMessage(from, gid, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMServerClient.MidGenerator.gen();
        }
        let cmd = 'sendgroupmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
                callback && callback(err, null);
                return;
            }
            var answer = { mid: payload.mid };
            if (data.mtime !== undefined) {
                answer.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, answer);
        }, timeout);
    }

    sendRoomMessage(from, rid, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMServerClient.MidGenerator.gen();
        }
        let cmd = 'sendroommsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
                callback && callback(err, null);
                return;
            }
            var answer = { mid: payload.mid };
            if (data.mtime !== undefined) {
                answer.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, answer);
        }, timeout);
    }

    broadcastMessage(from, mtype, msg, attrs, mid, timeout, callback) {
        if (!mid || mid.toString() == '0') {
            mid = RTMServerClient.MidGenerator.gen();
        }
        let cmd = 'broadcastmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
                callback && callback(err, null);
                return;
            }
            var answer = { mid: payload.mid };
            if (data.mtime !== undefined) {
                answer.mtime = new Int64BE(data.mtime);
            }
            callback && callback(null, answer);
        }, timeout);
    }

    static buildFileInfo(message) {
        try {
            let fileObject = JSON.parse(message.message);
            message.fileInfo = {
                url: fileObject.sl || "",
                size: fileObject.size || 0,
                surl: fileObject.surl || "",
                recognizedText: audioObject.rt || 0,
                isRTMAudio: false,
                language: "",
                duration: 0
            };

            try {
                let attrsObject = JSON.parse(message.attrs);
                let rtmAttrsDict = attrsObject.rtm || {};
                let typeStr = rtmAttrsDict.type || undefined;
                if (typeStr == "audiomsg") {
                    message.fileInfo.isRTMAudio = true;
                }

                if (message.fileInfo.isRTMAudio) {
                    message.fileInfo.language = rtmAttrsDict.lang || "";
                    message.fileInfo.duration = rtmAttrsDict.duration || 0;
                }

                message.attrs = attrsObject.custom || {};
            } catch (er) {
                return message;
            }
            return message;
        } catch (er) {
            return message;
        }
    }

    buildHistoryMessageResult(data, toId) {
        let historyMessages = {};
        historyMessages.count = Number(data['num']);
        historyMessages.lastCursorId = new Int64BE(data['lastid']);
        historyMessages.beginMsec = new Int64BE(data['begin']);
        historyMessages.endMsec = new Int64BE(data['end']);
        historyMessages.messages = [];

        let msgs = data['msgs'];
        if (msgs) {
            msgs.forEach(function (item, index) {

                let message = {
                    cursorId: new Int64BE(item[0]),
                    fromUid: new Int64BE(item[1]),
                    toId: toId,
                    messageType: Number(item[2]),
                    messageId: new Int64BE(item[3]),
                    message: item[5],
                    attrs: item[6],
                    modifiedTime: new Int64BE(item[7])
                };

                if (message.messageType >= 40 && message.messageType <= 50) {
                    message = RTMServerClient.buildFileInfo(message);

                    if (message.fileInfo != undefined) message.message = undefined;
                }

                historyMessages.messages[index] = message;
            });
        }
        return historyMessages;
    }

    getGroupMessage(uid, gid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getgroupmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
        let self = this;
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }
            let historyMessage = self.buildHistoryMessageResult.call(this, data, gid);
            callback && callback(null, historyMessage);
        }, timeout);
    }

    getRoomMessage(uid, rid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getroommsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
        let self = this;
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let historyMessage = self.buildHistoryMessageResult.call(this, data, rid);
            callback && callback(null, historyMessage);
        }, timeout);
    }

    getBroadcastMessage(uid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getbroadcastmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
        let self = this;
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let historyMessage = self.buildHistoryMessageResult.call(this, data, 0);
            callback && callback(null, historyMessage);
        }, timeout);
    }

    adjustHistoryMessageResultForP2PMessage(uid, ouid, historyMessage) {
        let selfDirection = new Int64BE(1);
        historyMessage.messages.forEach(function (item, index) {
            if (item.fromUid == selfDirection) {
                historyMessage.messages[index].fromUid = uid;
                historyMessage.messages[index].toId = ouid;
            } else {
                historyMessage.messages[index].fromUid = ouid;
                historyMessage.messages[index].toId = uid;
            }
        });
    }

    getP2PMessage(uid, ouid, desc, num, begin, end, lastid, mtypes, timeout, callback) {
        let cmd = 'getp2pmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
        let self = this;
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            let historyMessage = self.buildHistoryMessageResult.call(this, data, 0);
            self.adjustHistoryMessageResultForP2PMessage.call(this, uid, ouid, historyMessage);
            callback && callback(null, historyMessage);
        }, timeout);
    }

    deleteMessage(mid, from, to, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getMessage(mid, from, xid, type, timeout, callback) {
        let cmd = 'getmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
        let self = this;
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            if (!data.hasOwnProperty("id")) {
                callback && callback(null, {});
                return;
            }

            let message = {
                cursorId: new Int64BE(data.id),
                messageType: Number(data.mtype),
                message: data.msg,
                attrs: data.attrs,
                modifiedTime: new Int64BE(data.mtime)
            };

            if (message.messageType >= 40 && message.messageType <= 50) {
                message = RTMServerClient.buildFileInfo(message);

                if (message.fileInfo != undefined) message.message = undefined;
            }

            callback && callback(null, message);
        }, timeout);
    }

    getChat(mid, from, xid, type, timeout, callback) {
        this.getMessage(mid, from, xid, type, timeout, callback);
    }

    deleteGroupMessage(mid, from, gid, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    deleteRoomMessage(mid, from, rid, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    deleteBroadcastMessage(mid, from, timeout, callback) {
        let cmd = 'delmsg';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    sendChat(from, to, msg, attrs, mid, timeout, callback) {
        this.sendMessage(from, to, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    sendCmd(from, to, msg, attrs, mid, timeout, callback) {
        this.sendMessage(from, to, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    sendChats(from, tos, msg, attrs, mid, timeout, callback) {
        this.sendMessages(from, tos, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    sendCmds(from, tos, msg, attrs, mid, timeout, callback) {
        this.sendMessages(from, tos, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    sendGroupChat(from, gid, msg, attrs, mid, timeout, callback) {
        this.sendGroupMessage(from, gid, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    sendGroupCmd(from, gid, msg, attrs, mid, timeout, callback) {
        this.sendGroupMessage(from, gid, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    sendRoomChat(from, rid, msg, attrs, mid, timeout, callback) {
        this.sendRoomMessage(from, rid, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    sendRoomCmd(from, rid, msg, attrs, mid, timeout, callback) {
        this.sendRoomMessage(from, rid, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    broadcastChat(from, msg, attrs, mid, timeout, callback) {
        this.broadcastMessage(from, RTMConfig.CHAT_TYPE.text, msg, attrs, mid, timeout, callback);
    }

    broadcastCmd(from, msg, attrs, mid, timeout, callback) {
        this.broadcastMessage(from, RTMConfig.CHAT_TYPE.cmd, msg, attrs, mid, timeout, callback);
    }

    getGroupChat(uid, gid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getGroupMessage(uid, gid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    getRoomChat(uid, rid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getRoomMessage(uid, rid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    getBroadcastChat(uid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getBroadcastMessage(uid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    getP2PChat(uid, ouid, desc, num, begin, end, lastid, timeout, callback) {
        let mtypes = [RTMConfig.CHAT_TYPE.text, RTMConfig.CHAT_TYPE.audio, RTMConfig.CHAT_TYPE.cmd];
        this.getP2PMessage(uid, ouid, desc, num, begin, end, lastid, mtypes, timeout, callback);
    }

    deleteChat(mid, from, to, timeout, callback) {
        this.deleteMessage(mid, from, to, timeout, callback);
    }

    deleteGroupChat(mid, from, gid, timeout, callback) {
        this.deleteGroupMessage(mid, from, gid, timeout, callback);
    }

    deleteRoomChat(mid, from, rid, timeout, callback) {
        this.deleteRoomMessage(mid, from, rid, timeout, callback);
    }

    deleteBroadcastChat(mid, from, timeout, callback) {
        this.deleteBroadcastMessage(mid, from, timeout, callback);
    }

    translate(text, src, dst, type, profanity, uid, timeout, callback) {
        let cmd = 'translate';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    textCheck(text, uid, timeout, callback) {
        let cmd = 'tcheck';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            text: text
        };
        if (uid !== undefined) {
            payload.uid = uid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    imageCheck(image, type, uid, timeout, callback) {
        let cmd = 'icheck';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            image: image,
            type: type
        };
        if (uid !== undefined) {
            payload.uid = uid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    audioCheck(audio, type, lang, codec, srate, uid, timeout, callback) {
        let cmd = 'acheck';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            audio: audio,
            type: type,
            lang: lang
        };
        if (uid !== undefined) {
            payload.uid = uid;
        }
        if (codec !== undefined) {
            payload.codec = codec;
        }
        if (srate !== undefined) {
            payload.srate = srate;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    videoCheck(video, type, videoName, uid, timeout, callback) {
        let cmd = 'vcheck';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            video: video,
            type: type,
            videoName: videoName
        };
        if (uid !== undefined) {
            payload.uid = uid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    speech2Text(audio, type, lang, codec, srate, uid, timeout, callback) {
        let cmd = 'speech2text';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            audio: audio,
            type: type,
            lang: lang
        };
        if (uid !== undefined) {
            payload.uid = uid;
        }
        if (codec !== undefined) {
            payload.codec = codec;
        }
        if (srate !== undefined) {
            payload.srate = srate;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

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

    getOnlineUsers(uids, timeout, callback) {
        let cmd = 'getonlineusers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addProjectBlack(uid, btime, timeout, callback) {
        let cmd = 'addprojectblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    removeProjectBlack(uid, timeout, callback) {
        let cmd = 'removeprojectblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    isProjectBlack(uid, timeout, callback) {
        let cmd = 'isprojectblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    setUserInfo(uid, oinfo, pinfo, timeout, callback) {
        let cmd = 'setuserinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getUserInfo(uid, timeout, callback) {
        let cmd = 'getuserinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getUserOpenInfo(uids, timeout, callback) {
        let cmd = 'getuseropeninfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addFriends(uid, friends, timeout, callback) {
        let cmd = 'addfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    deleteFriends(uid, friends, timeout, callback) {
        let cmd = 'delfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getFriends(uid, timeout, callback) {
        let cmd = 'getfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    isFriend(uid, fuid, timeout, callback) {
        let cmd = 'isfriend';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    isFriends(uid, fuids, timeout, callback) {
        let cmd = 'isfriends';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addBlacks(uid, blacks, timeout, callback) {
        let cmd = 'addblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    deleteBlacks(uid, blacks, timeout, callback) {
        let cmd = 'delblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    isBlack(uid, buid, timeout, callback) {
        let cmd = 'isblack';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    isBlacks(uid, buids, timeout, callback) {
        let cmd = 'isblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getBlacks(uid, timeout, callback) {
        let cmd = 'getblacks';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addGroupMembers(gid, uids, timeout, callback) {
        let cmd = 'addgroupmembers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    deleteGroupMembers(gid, uids, timeout, callback) {
        let cmd = 'delgroupmembers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    deleteGroup(gid, timeout, callback) {
        let cmd = 'delgroup';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getGroupMembers(gid, timeout, callback) {
        let cmd = 'getgroupmembers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    isGroupMember(gid, uid, timeout, callback) {
        let cmd = 'isgroupmember';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getUserGroups(uid, timeout, callback) {
        let cmd = 'getusergroups';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addGroupBan(gid, uid, btime, timeout, callback) {
        let cmd = 'addgroupban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            btime: btime
        };
        if (gid !== undefined) {
            payload.gid = gid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    removeGroupBan(gid, uid, timeout, callback) {
        let cmd = 'removegroupban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        if (gid !== undefined) {
            payload.gid = gid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    isBanOfGroup(gid, uid, timeout, callback) {
        let cmd = 'isbanofgroup';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    setGroupInfo(gid, oinfo, pinfo, timeout, callback) {
        let cmd = 'setgroupinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getGroupInfo(gid, timeout, callback) {
        let cmd = 'getgroupinfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addRoomBan(rid, uid, btime, timeout, callback) {
        let cmd = 'addroomban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            btime: btime
        };
        if (rid !== undefined) {
            payload.rid = rid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    removeRoomBan(rid, uid, timeout, callback) {
        let cmd = 'removeroomban';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid
        };
        if (rid !== undefined) {
            payload.rid = rid;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    isBanOfRoom(rid, uid, timeout, callback) {
        let cmd = 'isbanofroom';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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
    5;
    addRoomMember(rid, uid, timeout, callback) {
        let cmd = 'addroommember';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    deleteRoomMember(rid, uid, timeout, callback) {
        let cmd = 'delroommember';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    setRoomInfo(rid, oinfo, pinfo, timeout, callback) {
        let cmd = 'setroominfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getRoomInfo(rid, timeout, callback) {
        let cmd = 'getroominfo';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    addEvtListener(opts, timeout, callback) {
        let cmd = 'addlisten';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid
        };
        if (opts.gids !== undefined) {
            payload.gids = opts.gids;
            for (i in payload.gids) {
                this._listenGroup.add(payload.gids[i]);
            }
        }
        if (opts.rids !== undefined) {
            payload.rids = opts.rids;
            for (i in payload.rids) {
                this._listenRoom.add(payload.rids[i]);
            }
        }
        if (opts.uids !== undefined) {
            payload.uids = opts.uids;
            for (i in payload.uids) {
                this._listenP2P.add(payload.uids[i]);
            }
        }
        if (opts.events !== undefined) {
            payload.events = opts.events;
            for (i in payload.events) {
                this._listenEv.add(payload.events[i]);
            }
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    removeEvtListener(opts, timeout, callback) {
        let cmd = 'removelisten';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid
        };
        if (opts.gids !== undefined) {
            payload.gids = opts.gids;
            for (i in payload.gids) {
                this._listenGroup.delete(payload.gids[i]);
            }
        }
        if (opts.rids !== undefined) {
            payload.rids = opts.rids;
            for (i in payload.rids) {
                this._listenRoom.delete(payload.rids[i]);
            }
        }
        if (opts.uids !== undefined) {
            payload.uids = opts.uids;
            for (i in payload.uids) {
                this._listenP2P.delete(payload.uids[i]);
            }
        }
        if (opts.events !== undefined) {
            payload.events = opts.events;
            for (i in payload.events) {
                this._listenEv.delete(payload.events[i]);
            }
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    setEvtListener(opts, timeout, callback) {
        let cmd = 'setlisten';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid
        };
        if (opts.p2p !== undefined && typeof opts.p2p == 'boolean') {
            payload.p2p = opts.p2p;
            this._listenAllP2P = payload.p2p;
        } else {
            if (opts.uids !== undefined) {
                payload.uids = opts.uids;
            }
            this._listenP2P.clear();
            for (i in payload.uids) {
                this._listenP2P.delete(payload.uids[i]);
            }
        }
        if (opts.group !== undefined && typeof opts.group == 'boolean') {
            payload.group = opts.group;
            this._listenAllGroup = payload.group;
        } else {
            if (opts.gids !== undefined) {
                payload.gids = opts.gids;
            }
            this._listenGroup.clear();
            for (i in payload.gids) {
                this._listenGroup.delete(payload.gids[i]);
            }
        }
        if (opts.room !== undefined && typeof opts.room == 'boolean') {
            payload.room = opts.room;
            this._listenAllRoom = payload.room;
        } else {
            if (opts.rids !== undefined) {
                payload.rids = opts.rids;
            }
            this._listenRoom.clear();
            for (i in payload.rids) {
                this._listenRoom.delete(payload.rids[i]);
            }
        }
        if (opts.ev !== undefined && typeof opts.ev == 'boolean') {
            payload.ev = opts.ev;
            this._listenAllEv = payload.ev;
        } else {
            if (opts.events !== undefined) {
                payload.events = opts.events;
            }
            this._listenEv.clear();
            for (i in payload.events) {
                this._listenEv.delete(payload.events[i]);
            }
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    dataGet(uid, key, timeout, callback) {
        let cmd = 'dataget';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    dataSet(uid, key, val, timeout, callback) {
        let cmd = 'dataset';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getRoomMembers(rid, timeout, callback) {
        let cmd = 'getroommembers';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rid: rid
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

    getRoomCount(rids, timeout, callback) {
        let cmd = 'getroomcount';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            rids: rids
        };
        sendQuest.call(this, this._baseClient, cmd, payload, function (err, data) {
            if (err) {
                callback && callback(err, null);
                return;
            }

            callback && callback(null, data);
        }, timeout);
    }

    addDevicePushOption(uid, type, xid, mtypes, timeout, callback) {
        let cmd = 'addoption';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            type: type,
            xid: xids
        };
        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    removeDevicePushOption(uid, type, xid, mtypes, timeout, callback) {
        let cmd = 'removeoption';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            uid: uid,
            type: type,
            xid: xids
        };
        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    getDevicePushOption(uid, timeout, callback) {
        let cmd = 'getoption';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    getMessageNum(type, xid, mtypes, begin, end, timeout, callback) {
        let cmd = 'getmsgnum';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
        let sign = genSign.call(this, salt, cmd, ts);

        let payload = {
            ts: ts,
            salt: salt,
            sign: sign,
            pid: this._pid,
            type: type,
            xid: xid
        };
        if (mtypes !== undefined) {
            payload.mtypes = mtypes;
        }
        if (begin !== undefined) {
            payload.begin = begin;
        }
        if (end !== undefined) {
            payload.end = end;
        }
        sendQuest.call(this, this._baseClient, cmd, payload, callback, timeout);
    }

    dataDelete(uid, key, timeout, callback) {
        let cmd = 'datadel';
        let ts = FPManager.instance.timestamp;
        let salt = RTMServerClient.MidGenerator.gen();
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

    sendFile(from, to, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new FPError('empty file bytes!', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR));
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

    sendFiles(from, tos, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new FPError('empty file bytes!', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR));
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

    sendGroupFile(from, gid, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new FPError('empty file bytes!', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR));
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

    sendRoomFile(from, rid, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new FPError('empty file bytes!', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR));
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

    broadcastFile(from, mtype, fileBytes, fileExt, fileName, mid, timeout, callback) {
        if (fileBytes === undefined || !fileBytes) {
            callback && callback(new FPError('empty file bytes!', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR));
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
    ErrorRecorder.instance.recorder = new RTMServerClient.RTMErrorRecorder(function (err) {
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
            this._baseClient.close(new FPError("ping timeout", FPConfig.ERROR_CODE.FPNN_EC_CORE_TIMEOUT));
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
    this._reconnectCount = 0;
    this._reconnectInterval = 0;

    if (this._listenAllP2P || this._listenAllGroup || this._listenAllRoom || this._listenAllEv) {
        this.setEvtListener({ p2p: this._listenAllP2P, group: this._listenAllGroup, room: this._listenAllRoom, ev: this._listenAllEv });
    } else if (this._listenP2P.size || this._listenGroup.size || this._listenRoom.size || this._listenEv.size) {
        this.setEvtListener({ uids: Array.from(this._listenP2P), gids: Array.from(this._listenGroup), rids: Array.from(this._listenRoom), events: Array.from(this._listenEv) });
    }
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

    this._isReconnect = true;
    if (++this._reconnectCount <= this._regressiveStrategy.startConnectFailedCount) {
        this.connect(this._encryptInfo);
        return;
    } else {
        if (!this._isClose && this._reconnect) updateDelayReconnectInterval.call(this);
        this._delayTimestamp = FPManager.instance.milliTimestamp;
    }
}

function updateDelayReconnectInterval() {

    let interval = this._regressiveStrategy.maxIntervalSeconds / this._regressiveStrategy.linearRegressiveCount;

    if (this._reconnectInterval == 0) this._reconnectInterval = this._regressiveStrategy.firstIntervalSeconds;else {
        this._reconnectInterval += interval;
        if (this._reconnectInterval > this._regressiveStrategy.maxIntervalSeconds) this._reconnectInterval = this._regressiveStrategy.maxIntervalSeconds;
    }
}

function delayConnect(timestamp) {
    if (this._delayTimestamp == 0) {
        return;
    }

    let interval = this._reconnectInterval;

    if (timestamp - this._delayTimestamp < 1000 * interval) return;

    this._delayCount = 0;
    this._delayTimestamp = 0;
    this.connect(this._encryptInfo);
}

function sendQuest(client, cmd, payload, callback, timeout) {
    if (!client) {
        callback && callback(new FPError('client has been destroyed!', FPConfig.ERROR_CODE.FPNN_EC_CORE_INVALID_CONNECTION), null);
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
        return new FPError('data is null!', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR);
    }
    if (data instanceof FPError) {
        return data;
    }
    if (data instanceof Error) {
        return new FPError(data.message, FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR);
    }
    if (isAnswerErr) {
        if (data.hasOwnProperty('code') && data.hasOwnProperty('ex')) {
            return new FPError(data.ex, data.code);
        }
    }
    return null;
}

function fileSendProcess(ops, mid, timeout, callback) {
    if (!mid || mid.toString() == '0') {
        mid = RTMServerClient.MidGenerator.gen();
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
                error: new FPError('file token error', FPConfig.ERROR_CODE.FPNN_EC_PROTO_FILE_SIGN)
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
                error: new FPError('file token is null or empty', FPConfig.ERROR_CODE.FPNN_EC_PROTO_FILE_SIGN)
            }, null);
            return;
        }
        if (!endpoint) {
            callback && callback({
                mid: mid,
                error: new FPError('file endpoint is null or empty', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_ERROR)
            }, null);
            return;
        }

        let ipport = endpoint.split(':');
        let fileMd5 = FPManager.instance.md5(ops.file).toLowerCase();
        let sign = FPManager.instance.md5(fileMd5 + ':' + token).toLowerCase();

        let fileClient = undefined;
        let key = ipport[0] + ":" + ipport[1];
        if (self._fileGateDict.hasOwnProperty(key)) {
            let fileClientInfo = self._fileGateDict[key];
            let time = fileClientInfo.time;
            if (FPManager.instance.timestamp - time < RTMConfig.FILE_GATE_CLIENT_HOLDING_SECONDS) {
                fileClient = fileClientInfo.client;
                if (fileClient.hasConnect) {
                    ops.token = token;
                    ops.sign = sign;
                    sendfile.call(self, fileClient, ops, mid, timeout, callback);
                    self._fileGateDict[key].time = FPManager.instance.timestamp;
                } else {
                    delete self._fileGateDict[key];
                }
            }
        }

        if (fileClient == undefined) {
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
            options.onClose = function () {
                delete self._fileGateDict[key];
            };
            let fileClient = new FPClient(options);
            self._fileGateDict[key] = { client: fileClient, time: FPManager.instance.timestamp };
            fileClient.connect();
        }
    });
}

function filetoken(ops, timeout, callback) {
    let cmd = 'filetoken';
    let ts = FPManager.instance.timestamp;
    let salt = RTMServerClient.MidGenerator.gen();
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
        callback && callback(new FPError('wrong cmd!', FPConfig.ERROR_CODE.FPNN_EC_CORE_UNKNOWN_METHOD));
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

RTMServerClient.MidGenerator = class {
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

RTMServerClient.RTMRegistration = class {
    static register() {
        FPManager.instance;
    }
};

RTMServerClient.RTMErrorRecorder = class {
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

RTMServerClient.EncryptInfo = class {
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

Object.setPrototypeOf(RTMServerClient.prototype, Emitter.prototype);
module.exports = RTMServerClient;

