'use strict'

const Emitter = require('events').EventEmitter;
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;
const RTMConfig = require('./RTMConfig');

class RTMProcessor{
    constructor(msgOptions){
        this._map = {};
        this._msgOptions = msgOptions;

        checkExpire.call(this);
    }

    service(data, cb){
        if (data.flag == 0){
            cb(JSON.stringify({}), false);
        }
        if (data.flag == 1){
            cb(msgpack.encode({}, this._msgOptions), false);
        }

        let payload = null;

        if (data.flag == 0){
            payload = JSON.parse(data.payload);
        }

        if (data.flag == 1){
            payload = msgpack.decode(data.payload, this._msgOptions);
        }

        if (payload){
            this[data.method].call(this, payload);
        }
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {number} data.mtype
     * @param {number} data.ftype
     * @param {Int64BE} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     */
    pushmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.ftype > 0){
            this.emit(RTMConfig.SERVER_PUSH.recvFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.gid
     * @param {number} data.mtype
     * @param {number} data.ftype
     * @param {Int64BE} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     */
    pushgroupmsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }


        if (data.gid){
            data.gid = new Int64BE(data.gid);
        }

        if (data.ftype > 0){
            this.emit(RTMConfig.SERVER_PUSH.recvGroupFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvGroupMessage, data);
    }

    /**
     * 
     * @param {Int64BE} data.from
     * @param {Int64BE} data.rid
     * @param {number} data.mtype
     * @param {number} data.ftype
     * @param {Int64BE} data.mid
     * @param {string} data.msg
     * @param {string} data.attrs
     */
    pushroommsg(data){
        if (data.from){
            data.from = new Int64BE(data.from);
        }

        if (data.mid){
            data.mid = new Int64BE(data.mid);
            if (!checkMid.call(this, data.mid)){
                return;
            }
        }

        if (data.rid){
            data.rid = new Int64BE(data.rid);
        }

        if (data.ftype > 0){
            this.emit(RTMConfig.SERVER_PUSH.recvRoomFile, data);
            return;
        }

        delete data.ftype; 
        this.emit(RTMConfig.SERVER_PUSH.recvRoomMessage, data);
    }

    /**
     * 
     * @param {object} data 
     */
    pushevents(data){
        this.emit(RTMConfig.SERVER_PUSH.recvEvents, data);
    }

    /**
     * 
     * @param {object} data 
     */
    ping(data){
        this.emit(RTMConfig.SERVER_PUSH.ping, data);
    }
}

function checkMid(mid){
    let key = mid.toString();
    if (this._map.hasOwnProperty(key)){
        if (this._map[key] > Date.now()){
            return false; 
        }
        delete this._map[key];
    }

    this._map[key] = RTMConfig.MID_TTL + Date.now();
    return true;
}

function checkExpire(){
    let self = this;
    setInterval(() => {
        for (let key in self._map){
            if (self._map[key] > Date.now()){
                continue;
            } 
            delayRemove.call(self, key);
        }
    }, RTMConfig.MID_TTL);
}

function delayRemove(key){
    let self = this;
    setTimeout(() => {
        delete self._map[key];
    }, 0);
}

Object.setPrototypeOf(RTMProcessor.prototype, Emitter.prototype);
module.exports = RTMProcessor;