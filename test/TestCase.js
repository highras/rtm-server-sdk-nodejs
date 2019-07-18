'use strict'

const path = require('path');
const fs = require('fs');
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;

const RTMClient = require('../src/rtm/RTMClient');
const RTMConfig = require('../src/rtm/RTMConfig');

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

        this._mid = new Int64BE(0);

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
        let pushName = RTMConfig.SERVER_PUSH.recvMessage;
        this._client.processor.on(pushName, function(data) {

            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });

        pushName = RTMConfig.SERVER_PUSH.recvPing;
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

    //ServerGate (1)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._to, 8, 'hello !', '', new Int64BE(0), self._timeout, function(err, data){

            self._mid = err ? err.mid : data.mid;
            cb && cb(err, data);
        });
    }, 'sendMessage');

    //ServerGate (2)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._tos, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendMessages');

    //ServerGate (3)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._gid, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendGroupMessage');

    //ServerGate (4)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._rid, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendRoomMessage');
    
    //ServerGate (5)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'broadcastMessage');

    //ServerGate (6)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._friends, self._timeout, cb);
    }, 'addFriends');

    //ServerGate (7)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, [new Int64BE(0, 778899)], self._timeout, cb);
    }, 'deleteFriends');

    //ServerGate (8)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getFriends');

    //ServerGate (9)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._fuid, self._timeout, cb);
    }, 'isFriend');

    //ServerGate (10)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._friends, self._timeout, cb);
    }, 'isFriends');

    //ServerGate (11)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, [self._from, self._to], self._timeout, cb);
    }, 'addGroupMembers');

    //ServerGate (12)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, [self._to], self._timeout, cb);
    }, 'deleteGroupMembers');

    //ServerGate (13)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._timeout, cb);
    }, 'deleteGroup');

    //ServerGate (14)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._timeout, cb);
    }, 'getGroupMembers');

    //ServerGate (15)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._from, self._timeout, cb);
    }, 'isGroupMember');

    //ServerGate (16)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getUserGroups');

    //ServerGate (17)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getToken');

    //ServerGate (18)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._tos, self._timeout, cb);
    }, 'getOnlineUsers');

    //ServerGate (19)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._to, 1, self._timeout, cb);
    }, 'addGroupBan');

    //ServerGate (20)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._to, self._timeout, cb);
    }, 'removeGroupBan');

    //ServerGate (21)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._to, 1, self._timeout, cb);
    }, 'addRoomBan');

    //ServerGate (22)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._to, self._timeout, cb);
    }, 'removeRoomBan');

    //ServerGate (23)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 1, self._timeout, cb);
    }, 'addProjectBlack');

    //ServerGate (24)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'removeProjectBlack');

    //ServerGate (25)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, self._from, self._timeout, cb);
    }, 'isBanOfGroup');

    //ServerGate (26)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._from, self._timeout, cb);
    }, 'isBanOfRoom');

    //ServerGate (27)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'isProjectBlack');

    //ServerGate (28)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 'sendfile', null, self._to, null, null, self._timeout, cb);
    }, 'fileToken');

    //ServerGate (29)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._gid, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getGroupMessage');

    //ServerGate (30)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getRoomMessage');

    //ServerGate (31)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getBroadcastMessage');

    //ServerGate (32)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._to, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getP2PMessage');

    //ServerGate (33)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._from, self._timeout, cb);
    }, 'addRoomMember');

    //ServerGate (34)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._rid, self._from, self._timeout, cb);
    }, 'deleteRoomMember');

    //ServerGate (35)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { rids:[self._rid], uids:[self._tos], events:['login', 'logout'] }, self._timeout, cb);
    }, 'addEvtListener');

    //ServerGate (36)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { events:['login'] }, self._timeout, cb);
    }, 'removeEvtListener');

    //ServerGate (37)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { p2p:true, group:true, room:true, ev:true } self._timeout, cb);
    }, 'setEvtListener');
/*
    //ServerGate (37)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { p2p:false, group:false, room:false, ev:false }, self._timeout, cb);
    }, 'setEvtListener');

    //ServerGate (37)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, { gids:[self._gid], rids:[], uids:[] events:[] }, self._timeout, cb);
    }, 'setEvtListener');
*/
    //ServerGate (38)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 'app-info', 'device-token', self._timeout, cb);
    }, 'addDevice');

    //ServerGate (39)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 'device-token', self._timeout, cb);
    }, 'removeDevice');

    //ServerGate (40)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._mid, self._from, self._to, 1, self._timeout, cb);
    }, 'deleteMessage');

    //ServerGate (41)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._to, null, self._timeout, cb);
    }, 'kickout');

    //fileGate (1)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._to, 50, self._filePath, new Int64BE(0), self._timeout, cb);
    }, 'sendFile');

    //filegate (2)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._tos, 50, self._filePath, new Int64BE(0), self._timeout, cb);
    }, 'sendFiles');

    //filegate (3)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._gid, 50, self._filePath, new Int64BE(0), self._timeout, cb);
    }, 'sendGroupFile');

    //filegate (4)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, self._rid, 50, self._filePath, new Int64BE(0), self._timeout, cb);
    }, 'sendRoomFile');

    //filegate (5)
    t.call(self, function(name, cb) {

        self._client[name].call(self._client, self._from, 50, self._filePath, new Int64BE(0), self._timeout, cb);
    }, 'broadcastFile');

    t.call(self, function(name, cb) {

        console.log('---------------(' + index + ')end!-----------------');
    });
}

function t(fn, name) {

    setTimeout(function() {

        if (name) {

            console.log('\n[TEST] ' + name + ':');
        }

        var cb = function(err, data) {

            if (err) {

                if (err.hasOwnProperty('mid')) {

                    console.error('\n mid:' + err.mid.toString(), err.error);
                    return;
                }

                console.error('\n ', err);
            }

            if (data) {

                if (data.hasOwnProperty('mid')) {

                    console.log('\n mid:' + data.mid.toString(), data.payload);
                    return;
                }

                console.log('\n ', data);
            }
        };

        fn(name, cb);
    }, index * 1000 * step);

    if (name) {

        index++;
    }
}

module.exports = TestCase;
