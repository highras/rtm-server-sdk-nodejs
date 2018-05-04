'use strict'

const path = require('path');
const fs = require('fs');
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;

const RTMClient = require('../src/rtm/RTMClient');

let step = 2;
let index = 0;

class TestCase {

    constructor (options) {

        this._from = new Int64BE(0, 778898);
        this._to = new Int64BE(0, 778899);
        this._tos = [new Int64BE(0, 778899), new Int64BE(0, 778877)];
        this._gid = new Int64BE(0, 999999);
        this._rid = new Int64BE(0, 666666);
        this._friends = [new Int64BE(0, 778899), new Int64BE(0, 778877)];
        this._fuid = new Int64BE(0, 778877);
        this._lat = 39239.1123;
        this._lng = 69394.4850;
        this._timeout = 10 * 1000;

        this._filePath = path.resolve(__dirname, '../key/test-secp256k1-compressed-public.key');

        this._options = {
            curveName: 'secp256k1',
            strength: 128,
            streamMode: false
        };

        this._client = new RTMClient(options);

        this._client.enableConnect();
        // this._client.enableEncryptorByFile(this._filePath, this._options);

        //receive
        let pushName = this._client.rtmConfig.SERVER_PUSH.recvMessage;
        this._client.processor.on(pushName, function(data) {

            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });

        pushName = this._client.rtmConfig.SERVER_PUSH.recvPing;
        this._client.processor.on(pushName, function(data) {

            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });

        let self = this;

        this._client.on('connect', function(data) {
            
            onConnect.call(self);
        });

        this._client.on('error', function(err) {

            console.error(err);
        });

        this._client.on('close', function() {

            console.log('closed!');
        });
    }
}

function onConnect() {

    let self = this;

    index = 0;
    console.log('connect!\n\n');

    t.call(self, function(name, cb) {

        console.log('---------------begin!-----------------')
    });

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, true, self._timeout, cb);
    }, 'setEvtListener');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, false, self._timeout, cb);
    }, 'setEvtListener');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { gids:[self._gid], rids:[], p2p:false, events:[] }, self._timeout, cb);
    }, 'setEvtListener');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { rids:[self._rid], p2p:true, events:['login', 'logout'] }, self._timeout, cb);
    }, 'addEvtListener');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { events:['login'] }, self._timeout, cb);
    }, 'removeEvtListener');
    
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._to, 8, 'hello !', '', self._timeout, cb);
    }, 'sendMessage');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._tos, 8, 'hello !', '', self._timeout, cb);
    }, 'sendMessages');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._gid, 8, 'hello !', '', self._timeout, cb);
    }, 'sendGroupMessage');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._rid, 8, 'hello !', '', self._timeout, cb);
    }, 'sendRoomMessage');
    
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 8, 'hello !', '', self._timeout, cb);
    }, 'broadcastMessage');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._friends, self._timeout, cb);
    }, 'addFriends');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, [new Int64BE(0, 778899)], self._timeout, cb);
    }, 'deleteFriends');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getFriends');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._fuid, self._timeout, cb);
    }, 'isFriend');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._friends, self._timeout, cb);
    }, 'isFriends');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, [self._from, self._to], self._timeout, cb);
    }, 'addGroupMembers');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, [self._to], self._timeout, cb);
    }, 'deleteGroupMembers');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._timeout, cb);
    }, 'getGroupMembers');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._from, self._timeout, cb);
    }, 'isGroupMember');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getUserGroups');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._timeout, cb);
    }, 'deleteGroup');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getToken');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._tos, self._timeout, cb);
    }, 'getOnlineUsers');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._to, 1, self._timeout, cb);
    }, 'addGroupBan');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._to, self._timeout, cb);
    }, 'removeGroupBan');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._to, 1, self._timeout, cb);
    }, 'addRoomBan');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._to, self._timeout, cb);
    }, 'removeRoomBan');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 1, self._timeout, cb);
    }, 'addProjectBlack');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'removeProjectBlack');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._from, self._timeout, cb);
    }, 'isBanOfGroup');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._from, self._timeout, cb);
    }, 'isBanOfRoom');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'isProjectBlack');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._lat, self._lng, self._timeout, cb);
    }, 'setGeo');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getGeo');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, [self._from, self._to], self._timeout, cb);
    }, 'getGeos');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._to, 8, self._filePath, self._timeout, cb);
    }, 'sendFile');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 'app-info', 'device-token', self._timeout, cb);
    }, 'addDevice');

    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 'device-token', self._timeout, cb);
    }, 'removeDevice');

    t.call(self, function(name, cb) {

        console.log('---------------(' + index + ')end!-----------------');
    });
}

function t(fn, name) {

    setTimeout(function() {

        var cb = function(err, data) {
        
            if (err) {

                console.error('\n[ERR] ' + name + ':\n', err.message);
            }

            if (data) {
            
                console.log('\n[DATA] ' + name + ':\n', data);
            }
        };

        fn(name, cb);
    }, index * 1000 * step);

    if (name) {

        index++;
    }
}

module.exports = TestCase;
