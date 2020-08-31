'use strict'

const path = require('path');
const fs = require('fs');
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;

const RTMClient = require('../src/rtm/RTMClient');
const RTMConfig = require('../src/rtm/RTMConfig');
const FPError = require('../src/fpnn/FPError');

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
        this._fileBytes = fs.readFileSync(path.resolve(__dirname, '../key/test-secp256k1-public.der'));

        this._options = {
            curve: 'secp256k1',
            strength: 128,
            streamMode: false
        };

        this._client = new RTMClient(options);
        this._client.connect(this._filePath, this._options);

        let self = this;
        this._client.on('connect', function(data) {
            onConnect.call(self);
        });
        this._client.on('err', function(err) {
            //console.error(err);
        });
        this._client.on('close', function() {
            console.log('closed!');
        });

        //receive
        let pushName = RTMConfig.SERVER_PUSH.recvMessage;
        this._client.processor.addPushService(pushName, function(data) {
            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });
        let pushName2 = RTMConfig.SERVER_PUSH.recvGroupMessage;
        this._client.processor.addPushService(pushName2, function(data) {
            console.log('\n[PUSH] ' + pushName2 + ':\n', data);
        });
        let pushName3 = RTMConfig.SERVER_PUSH.recvEvent;
        this._client.processor.addPushService(pushName3, function(data) {
            console.log('\n[PUSH] ' + pushName3 + ':\n', data);
        });
        let pushName4 = RTMConfig.SERVER_PUSH.recvPing;
        this._client.processor.addPushService(pushName4, function(data) {

            console.log('\n[PUSH] ' + pushName4 + ':\n', data);
        });
    }
}

function onConnect() {
    console.log('connect!');
    index = 0;
    let self = this;
    t.call(self, function(name, cb) {
        console.log('---------------begin!-----------------')
    });
/*
    //ServerGate (9c) setEvtListener
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, { p2p:true, group:false, room:true, ev:true }, self._timeout, cb);
    }, 'setEvtListener');

    //ServerGate (1a) getToken
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getToken');

    //ServerGate (1b) kickout
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._to, null, self._timeout, cb);
    }, 'kickout');

    //ServerGate (1c) addDevice
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 'app-info', 'device-token', self._timeout, cb);
    }, 'addDevice');

    //ServerGate (1d) removeDevice
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 'device-token', self._timeout, cb);
    }, 'removeDevice');

    //ServerGate (1e) removeToken
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'removeToken');

    //ServerGate (2a) sendMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._to, 127, 'hello !', '', new Int64BE(0), self._timeout, function(err, data){
            self._mid = err ? err.mid : data.mid;
            cb && cb(err, data);
        });
    }, 'sendMessage');

    //ServerGate (2b) sendMessages
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._tos, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendMessages');

    //ServerGate (2c) sendGroupMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._gid, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendGroupMessage');

    //ServerGate (2d) sendRoomMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._rid, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendRoomMessage');
    
    //ServerGate (2e) broadcastMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 8, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'broadcastMessage');

    //ServerGate (2f) getGroupMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, 123, self._gid, false, 10, 0, 0, 0, [], self._timeout, cb);
    }, 'getGroupMessage');

    //ServerGate (2g) getRoomMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, 123, self._rid, false, 10, 0, 0, 0, [], self._timeout, cb);
    }, 'getRoomMessage');

    //ServerGate (2h) getBroadcastMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, 123, false, 10, 0, 0, 0, [], self._timeout, cb);
    }, 'getBroadcastMessage');

    //ServerGate (2i) getP2PMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._to, false, 10, 0, 0, 0, [], self._timeout, cb);
    }, 'getP2PMessage');

    //ServerGate (2j) getMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._to, 1, self._timeout, cb);
    }, 'getMessage');

    //ServerGate (2j) getChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._to, 1, self._timeout, cb);
    }, 'getChat');


    //ServerGate (2j) deleteMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._to, self._timeout, cb);
    }, 'deleteMessage');

    //ServerGate (2j') deleteGroupMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._gid, self._timeout, cb);
    }, 'deleteGroupMessage');

    //ServerGate (2j'') deleteRoomMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._rid, self._timeout, cb);
    }, 'deleteRoomMessage');

    //ServerGate (2j''') deleteBroadcastMessage
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._timeout, cb);
    }, 'deleteBroadcastMessage');

    //ServerGate (3a) sendChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._to, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendChat');

    //ServerGate (3a'') sendCmd
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._to, 'friends_invite', '', new Int64BE(0), self._timeout, cb);
    }, 'sendCmd');

    //ServerGate (3b) sendChats
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._tos, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendChats');

    //ServerGate (3b'') sendCmds
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._tos, 'friends_invite', '', new Int64BE(0), self._timeout, cb);
    }, 'sendCmds');

    //ServerGate (3c) sendGroupChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._gid, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendGroupChat');

    //ServerGate (3c'') sendGroupCmd
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._gid, 'group_friends_invite', '', new Int64BE(0), self._timeout, cb);
    }, 'sendGroupCmd');

    //ServerGate (3d) sendRoomChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._rid, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'sendRoomChat');

    //ServerGate (3d'') sendRoomCmd
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._rid, 'room_friends_invite', '', new Int64BE(0), self._timeout, cb);
    }, 'sendRoomCmd');
    
    //ServerGate (3e) broadcastChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 'hello !', '', new Int64BE(0), self._timeout, cb);
    }, 'broadcastChat');

    //ServerGate (3e'') broadcastCmd
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 'broadcast_friends_invite', '', new Int64BE(0), self._timeout, cb);
    }, 'broadcastCmd');

    //ServerGate (3f) getGroupChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getGroupChat');

    //ServerGate (3g) getRoomChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getRoomChat');

    //ServerGate (3h) getBroadcastChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getBroadcastChat');

    //ServerGate (3i) getP2PChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._to, false, 10, 0, 0, 0, self._timeout, cb);
    }, 'getP2PChat');

    //ServerGate (3j) deleteChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._to, self._timeout, cb);
    }, 'deleteChat');

    //ServerGate (3j') deleteGroupChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._gid, self._timeout, cb);
    }, 'deleteGroupChat');

    //ServerGate (3j'') deleteRoomChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._rid, self._timeout, cb);
    }, 'deleteRoomChat');

    //ServerGate (3j''') deleteBroadcastChat
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._mid, self._from, self._timeout, cb);
    }, 'deleteBroadcastChat');

    //ServerGate (3k) translate
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, '点数优惠', RTMConfig.TRANS_LANGUAGE.zh_cn, RTMConfig.TRANS_LANGUAGE.en, 'chat', 'censor', true, undefined, self._timeout, cb);
    }, 'translate');

    //ServerGate (3i) profanity
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, '点数优惠', true, undefined, self._timeout, cb);
    }, 'profanity');

    //ServerGate (3j) transcribe

    //ServerGate (4a) fileToken
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 'sendfile', null, self._to, null, null, self._timeout, cb);
    }, 'fileToken');

    //ServerGate (5a) getOnlineUsers
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._tos, self._timeout, cb);
    }, 'getOnlineUsers');

    //ServerGate (5b) addProjectBlack
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 1, self._timeout, cb);
    }, 'addProjectBlack');

    //ServerGate (5c) removeProjectBlack
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'removeProjectBlack');

    //ServerGate (5d) isProjectBlack
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'isProjectBlack');

    //ServerGate (5e) setUserInfo
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'setUserInfo');

    //ServerGate (5f) getUserInfo
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getUserInfo');

    //ServerGate (5g) getUserOpenInfo
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._tos, self._timeout, cb);
    }, 'getUserOpenInfo');

    //ServerGate (6a) addFriends
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._friends, self._timeout, cb);
    }, 'addFriends');

    //ServerGate (6b) deleteFriends
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, [new Int64BE(0, 778899)], self._timeout, cb);
    }, 'deleteFriends');

    //ServerGate (6c) getFriends
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getFriends');

    //ServerGate (6d) isFriend
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._fuid, self._timeout, cb);
    }, 'isFriend');

    //ServerGate (6e) isFriends
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._friends, self._timeout, cb);
    }, 'isFriends');

    //ServerGate (7a) addGroupMembers
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, [self._from, self._to], self._timeout, cb);
    }, 'addGroupMembers');

    //ServerGate (7b) deleteGroupMembers
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, [self._to], self._timeout, cb);
    }, 'deleteGroupMembers');

    //ServerGate (7c) deleteGroup
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, self._timeout, cb);
    }, 'deleteGroup');

    //ServerGate (7d) getGroupMembers
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, self._timeout, cb);
    }, 'getGroupMembers');

    //ServerGate (7e) isGroupMember
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, self._from, self._timeout, cb);
    }, 'isGroupMember');

    //ServerGate (7f) getUserGroups
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._timeout, cb);
    }, 'getUserGroups');

    //ServerGate (7g) addGroupBan
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, self._to, 1, self._timeout, cb);
    }, 'addGroupBan');

    //ServerGate (7h) removeGroupBan
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, self._to, self._timeout, cb);
    }, 'removeGroupBan');

    //ServerGate (7i) isBanOfGroup
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, self._from, self._timeout, cb);
    }, 'isBanOfGroup');

    //ServerGate (7j) setGroupInfo
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, 'oinfo', 'pinfo', self._timeout, cb);
    }, 'setGroupInfo');

    //ServerGate (7k) getGroupInfo
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._gid, self._timeout, cb);
    }, 'getGroupInfo');

    //ServerGate (8a) addRoomBan
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, self._to, 1, self._timeout, cb);
    }, 'addRoomBan');

    //ServerGate (8b) removeRoomBan
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, self._to, self._timeout, cb);
    }, 'removeRoomBan');

    //ServerGate (8c) isBanOfRoom
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, self._from, self._timeout, cb);
    }, 'isBanOfRoom');

    //ServerGate (8d) addRoomMember
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, self._from, self._timeout, cb);
    }, 'addRoomMember');

    //ServerGate (8e) deleteRoomMember
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, self._from, self._timeout, cb);
    }, 'deleteRoomMember');

    //ServerGate (8f) setRoomInfo
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, 'oinfo', 'pinfo', self._timeout, cb);
    }, 'setRoomInfo');

    //ServerGate (8g) getRoomInfo
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._rid, self._timeout, cb);
    }, 'getRoomInfo');

    //ServerGate (9a) addEvtListener
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, { rids:[self._rid], uids:[self._tos], events:['login', 'logout'] }, self._timeout, cb);
    }, 'addEvtListener');

    //ServerGate (9b) removeEvtListener
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, { events:['login'] }, self._timeout, cb);
    }, 'removeEvtListener');

    //ServerGate (9c') setEvtListener
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, { p2p: true, group: true, room: true, ev: true, gids:[self._gid], rids:[], uids:[], events:[] }, self._timeout, cb);
    }, 'setEvtListener');

    //ServerGate (10b) dataSet
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._to, 'db-test-key', 'db-test-value', self._timeout, cb);
    }, 'dataSet');

    //ServerGate (10a) dataGet
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._to, 'db-test-key', self._timeout, cb);
    }, 'dataGet');

    //ServerGate (10c) dataDelete
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._to, 'db-test-key', self._timeout, cb);
    }, 'dataDelete');
*/

    //fileGate (1)
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._to, 50, self._fileBytes, null, null, new Int64BE(0), self._timeout, cb);
    }, 'sendFile');

    setInterval(function() {
        t.call(self, function(name, cb) {
            self._client[name].call(self._client, self._from, self._to, 50, self._fileBytes, null, null, new Int64BE(0), self._timeout, cb);
        }, 'sendFile');
    }, 5000);
/*
    //filegate (2)
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._tos, 50, self._fileBytes, "", "", new Int64BE(0), self._timeout, cb);
    }, 'sendFiles');

    //filegate (3)
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._gid, 50, self._fileBytes, "jpg", "pic", new Int64BE(0), self._timeout, cb);
    }, 'sendGroupFile');

    //filegate (4)
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, self._rid, 50, self._fileBytes, null, null, new Int64BE(0), self._timeout, cb);
    }, 'sendRoomFile');

    //filegate (5)
    t.call(self, function(name, cb) {
        self._client[name].call(self._client, self._from, 50, self._fileBytes, null, null, new Int64BE(0), self._timeout, cb);
    }, 'broadcastFile');
*/
    t.call(self, function(name, cb) {
        console.log('---------------(' + index + ')end!-----------------');
    });
}

function t(fn, name) {
    setTimeout(function() {
        if (name) {
            console.log('[TEST] ' + name + ':');
        }
        fn && fn(name, cb);
    }, index * 1000 * step);
    if (name) {
        index++;
    }
}

function cb(err, data){
    if (err) {
        console.error(err);
    }
    if (data) {
        console.log(data);
    }
}

module.exports = TestCase;
