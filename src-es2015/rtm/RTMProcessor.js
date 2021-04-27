'use strict';

const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;

const FPManager = require('../fpnn/FPManager');
const ErrorRecorder = require('../fpnn/ErrorRecorder');
const RTMConfig = require('./RTMConfig');
const RTMServerClient = require('./RTMServerClient');

const JSON_PAYLOAD = '{}';
const MSGPACK_PAYLOAD = Buffer.from([0x80]);

class RTMProcessor {
    constructor(msgOptions) {
        this._actionMap = {};
        this._duplicateMap = {};
        this._msgOptions = msgOptions;

        this._lastPingTimestamp = 0;
    }

    destroy() {
        this.clearPingTimestamp();

        this._actionMap = {};
        this._duplicateMap = {};
    }

    service(data, answer) {
        if (!data) {
            return;
        }

        let payload = null;
        if (data.flag == 0 && data.payload != null) {
            answer && answer(JSON_PAYLOAD, false);
            try {
                payload = JSON.parse(data.payload);
            } catch (er) {
                ErrorRecorder.instance.recordError(er);
            }
        }

        if (data.flag == 1 && data.payload != null) {
            answer && answer && answer(MSGPACK_PAYLOAD, false);
            try {
                payload = msgpack.decode(data.payload, this._msgOptions);
            } catch (er) {
                ErrorRecorder.instance.recordError(er);
            }
        }

        if (payload) {
            if (payload.mid !== undefined) {
                payload.mid = new Int64BE(payload.mid);
            }
            if (payload.from !== undefined) {
                payload.from = new Int64BE(payload.from);
            }
            if (payload.to !== undefined) {
                payload.to = new Int64BE(payload.to);
            }
            if (payload.gid !== undefined) {
                payload.gid = new Int64BE(payload.gid);
            }
            if (payload.rid !== undefined) {
                payload.rid = new Int64BE(payload.rid);
            }
            if (payload.mtime !== undefined) {
                payload.mtime = new Int64BE(payload.mtime);
            }
            if (payload.uid !== undefined) {
                payload.uid = new Int64BE(payload.uid);
            }

            try {
                this[data.method].call(this, payload);
            } catch (er) {
                ErrorRecorder.instance.recordError(er);
            }
        }
    }

    hasPushService(name) {
        if (name === undefined || !name) {
            return false;
        }
        return true;
    }

    addPushService(name, callback) {
        if (name === undefined || !name) {
            return;
        }
        if (!this._actionMap.hasOwnProperty(name)) {
            this._actionMap[name] = callback;
        } else {
            console.error('push service exist!');
        }
    }

    removePushService(name) {
        if (name === undefined || !name) {
            return;
        }
        if (this._actionMap.hasOwnProperty(name)) {
            delete this._actionMap[name];
        }
    }

    /**
     *
     * ServerGate (1a)
     *
     * @param {object}          data
     */
    ping(data) {
        pushService.call(this, RTMConfig.SERVER_PUSH.recvPing, data);
        this._lastPingTimestamp = FPManager.instance.milliTimestamp;
    }

    buildPushMessage(data, toId) {
        let message = {
            fromUid: new Int64BE(data.from),
            toId: new Int64BE(toId),
            messageType: Number(data.mtype),
            messageId: new Int64BE(data.mid),
            message: data.msg,
            attrs: data.attrs,
            modifiedTime: new Int64BE(data.mtime)
        };

        if (message.messageType >= 40 && message.messageType <= 50) {
            message = RTMServerClient.buildFileInfo(message);

            if (message.fileInfo != undefined) message.message = undefined;
        }
        return message;
    }

    pushmsg(data) {
        let mtype = 0;
        let name = RTMConfig.SERVER_PUSH.recvMessage;

        if (!data) {
            pushService.call(this, name, data);
            return;
        }

        if (data.hasOwnProperty('mid') && data.hasOwnProperty('from')) {
            if (!checkMid.call(this, 1, data.mid, data.from)) {
                return;
            }
        }

        let message = this.buildPushMessage(data);

        if (data.hasOwnProperty('mtype')) {
            mtype = data.mtype;
        }
        if (mtype == RTMConfig.CHAT_TYPE.text) {
            name = RTMConfig.SERVER_PUSH.recvChat;
        }

        if (mtype == RTMConfig.CHAT_TYPE.cmd) {
            name = RTMConfig.SERVER_PUSH.recvCmd;
        }
        if (mtype >= 40 && mtype <= 50) {
            name = RTMConfig.SERVER_PUSH.recvFile;
        }

        pushService.call(this, name, message);
    }

    pushgroupmsg(data) {
        let mtype = 0;
        let name = RTMConfig.SERVER_PUSH.recvGroupMessage;

        if (!data) {
            pushService.call(this, name, data);
            return;
        }

        if (data.hasOwnProperty('mid') && data.hasOwnProperty('from') && data.hasOwnProperty('gid')) {
            if (!checkMid.call(this, 2, data.mid, data.from, data.gid)) {
                return;
            }
        }

        let message = this.buildPushMessage(data);

        if (data.hasOwnProperty('mtype')) {
            mtype = data.mtype;
        }
        if (mtype == RTMConfig.CHAT_TYPE.text) {
            name = RTMConfig.SERVER_PUSH.recvGroupChat;
        }

        if (mtype == RTMConfig.CHAT_TYPE.cmd) {
            name = RTMConfig.SERVER_PUSH.recvGroupCmd;
        }
        if (mtype >= 40 && mtype <= 50) {
            name = RTMConfig.SERVER_PUSH.recvGroupFile;
        }

        pushService.call(this, name, message);
    }

    pushroommsg(data) {
        let mtype = 0;
        let name = RTMConfig.SERVER_PUSH.recvRoomMessage;

        if (!data) {
            pushService.call(this, name, data);
            return;
        }

        if (data.hasOwnProperty('mid') && data.hasOwnProperty('from') && data.hasOwnProperty('rid')) {
            if (!checkMid.call(this, 3, data.mid, data.from, data.rid)) {
                return;
            }
        }

        let message = this.buildPushMessage(data);

        if (data.hasOwnProperty('mtype')) {
            mtype = data.mtype;
        }
        if (mtype == RTMConfig.CHAT_TYPE.text) {
            name = RTMConfig.SERVER_PUSH.recvRoomChat;
        }

        if (mtype == RTMConfig.CHAT_TYPE.cmd) {
            name = RTMConfig.SERVER_PUSH.recvRoomCmd;
        }
        if (mtype >= 40 && mtype <= 50) {
            name = RTMConfig.SERVER_PUSH.recvRoomFile;
        }

        pushService.call(this, name, message);
    }

    pushevent(data) {
        pushService.call(this, RTMConfig.SERVER_PUSH.recvEvent, data);
    }

    pushfile(data) {}

    pushgroupfile(data) {}

    pushroomfile(data) {}

    pushchat(data) {}

    pushcmd(data) {}

    pushgroupchat(data) {}

    pushgroupcmd(data) {}

    pushroomchat(data) {}

    pushroomcmd(data) {}

    get pingTimestamp() {
        return this._lastPingTimestamp;
    }

    clearPingTimestamp() {
        this._lastPingTimestamp = 0;
    }

    initPingTimestamp() {
        if (this._lastPingTimestamp == 0) {
            this._lastPingTimestamp = FPManager.instance.milliTimestamp;
        }
    }

    onSecond(timestamp) {
        checkExpire.call(this, timestamp);
    }
}

function pushService(name, data) {
    if (this._actionMap.hasOwnProperty(name)) {
        let callback = this._actionMap[name];
        try {
            callback && callback(data);
        } catch (er) {
            ErrorRecorder.instance.recordError(er);
        }
    }
}

function checkMid(type, mid, uid, rgid) {
    let sb = [];
    sb.push(type.toString());
    sb.push(mid.toString());
    sb.push(uid.toString());
    if (rgid !== undefined) {
        sb.push(rgid.toString());
    }

    let key = sb.join('_');
    let ts = FPManager.instance.milliTimestamp;
    if (this._duplicateMap.hasOwnProperty(key)) {
        if (this._duplicateMap[key] > ts) {
            return false;
        }
        delete this._duplicateMap[key];
    }
    this._duplicateMap[key] = RTMConfig.MID_TTL + ts;
    return true;
}

function checkExpire(timestamp) {
    let self = this;
    for (let key in this._duplicateMap) {
        if (this._duplicateMap[key] > timestamp) {
            continue;
        }
        FPManager.instance.asyncTask(function (state) {
            delete self._duplicateMap[key];
        }, null);
    }
}

module.exports = RTMProcessor;

