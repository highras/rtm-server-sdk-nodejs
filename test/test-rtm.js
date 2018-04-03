'use strict'

const path = require('path');
const fs = require('fs');
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;

const RTMClient = require('../src/rtm/RTMClient');

let self = this;

let step = 2;
let index = 0;

let t = function(fn, name){
    setTimeout(function(){
        var cb = function(err, data){
            if (err){
                console.error('\n[ERR] ' + name + ':\n', err.message);
            }
            if (data){
                console.log('\n[DATA] ' + name + ':\n', data);
            }
        };
        fn(name, cb);
    }, index * 1000 * step);

    if (name){
        index++;
    }
}

let from = new Int64BE(0, 778898);
let to = new Int64BE(0, 778899);
let tos = [new Int64BE(0, 778899), new Int64BE(0, 778877)];
let gid = new Int64BE(0, 999999);
let rid = new Int64BE(0, 666666);
let friends = [new Int64BE(0, 778899), new Int64BE(0, 778877)];
let fuid = new Int64BE(0, 778877);
let lat = 39239.1123;
let lng = 69394.4850;
let timeout = 10 * 1000;

let file_path = path.resolve(__dirname, '../key/test-secp256k1-public.pem');

let client = new RTMClient({ 
    host: '35.167.185.139',
    port: 13315,
    autoReconnect: true,
    connectionTimeout: 10 * 1000,
    pid: 1000014,
    secretKey: 'd8c94627-db2e-4206-bd4f-967b5b4e94dc'
});

let filePath = path.resolve(__dirname, '../key/test-secp256k1-compressed-public.key');

let options = {
    curveName: null,
    strength: 128,
    streamMode: false
}

client.enableConnect();
// client.enableEncryptorByFile(filePath, options);
    
//receive
let pushName = client.rtmConfig.SERVER_PUSH.recvMessage;
client.processor.on(pushName, function(data){
    console.log('\n[PUSH] ' + pushName + ':\n', data);
});

pushName = client.rtmConfig.SERVER_PUSH.recvPing;
client.processor.on(pushName, function(data){
    console.log('\n[PUSH] ' + pushName + ':\n', data);
});

//send
client.on('connect', function(data){
    index = 0;
    console.log('connect!\n\n');

    t(function(name, cb){
		console.log('---------------begin!-----------------')
    });

    t(function(name, cb){
		client[name].call(client, true, timeout, cb);
    }, 'setEvtListener');

    t(function(name, cb){
		client[name].call(client, false, timeout, cb);
    }, 'setEvtListener');

    t(function(name, cb){
		client[name].call(client, { gids:[gid], rids:[], p2p:false, events:[] }, timeout, cb);
    }, 'setEvtListener');

    t(function(name, cb){
		client[name].call(client, { rids:[rid], p2p:true, events:['login', 'logout'] }, timeout, cb);
    }, 'addEvtListener');

    t(function(name, cb){
		client[name].call(client, { events:['login'] }, timeout, cb);
    }, 'removeEvtListener');
    
    t(function(name, cb){
		client[name].call(client, from, to, 8, 'hello !', '', timeout, cb);
    }, 'sendMessage');

    t(function(name, cb){
		client[name].call(client, from, tos, 8, 'hello !', '', timeout, cb);
    }, 'sendMessages');

    t(function(name, cb){
		client[name].call(client, from, gid, 8, 'hello !', '', timeout, cb);
    }, 'sendGroupMessage');

    t(function(name, cb){
		client[name].call(client, from, rid, 8, 'hello !', '', timeout, cb);
    }, 'sendRoomMessage');
    
    t(function(name, cb){
		client[name].call(client, from, 8, 'hello !', '', timeout, cb);
    }, 'broadcastMessage');

    t(function(name, cb){
		client[name].call(client, from, friends, timeout, cb);
    }, 'addFriends');

    t(function(name, cb){
		client[name].call(client, from, [new Int64BE(0, 778899)], timeout, cb);
    }, 'deleteFriends');

    t(function(name, cb){
		client[name].call(client, from, timeout, cb);
    }, 'getFriends');

    t(function(name, cb){
		client[name].call(client, from, fuid, timeout, cb);
    }, 'isFriend');

    t(function(name, cb){
		client[name].call(client, from, friends, timeout, cb);
    }, 'isFriends');

    t(function(name, cb){
		client[name].call(client, gid, [from, to], timeout, cb);
    }, 'addGroupMembers');

    t(function(name, cb){
		client[name].call(client, gid, [to], timeout, cb);
    }, 'deleteGroupMembers');

    t(function(name, cb){
		client[name].call(client, gid, timeout, cb);
    }, 'getGroupMembers');

    t(function(name, cb){
		client[name].call(client, gid, from, timeout, cb);
    }, 'isGroupMember');

    t(function(name, cb){
		client[name].call(client, from, timeout, cb);
    }, 'getUserGroups');

    t(function(name, cb){
		client[name].call(client, gid, timeout, cb);
    }, 'deleteGroup');

    t(function(name, cb){
		client[name].call(client, from, timeout, cb);
    }, 'getToken');

    t(function(name, cb){
		client[name].call(client, tos, timeout, cb);
    }, 'getOnlineUsers');

    t(function(name, cb){
		client[name].call(client, gid, to, 1, timeout, cb);
    }, 'addGroupBan');

    t(function(name, cb){
		client[name].call(client, gid, to, timeout, cb);
    }, 'removeGroupBan');

    t(function(name, cb){
		client[name].call(client, rid, to, 1, timeout, cb);
    }, 'addRoomBan');

    t(function(name, cb){
		client[name].call(client, rid, to, timeout, cb);
    }, 'removeRoomBan');

    t(function(name, cb){
		client[name].call(client, from, 1, timeout, cb);
    }, 'addProjectBlack');

    t(function(name, cb){
		client[name].call(client, from, timeout, cb);
    }, 'removeProjectBlack');

    t(function(name, cb){
		client[name].call(client, gid, from, timeout, cb);
    }, 'isBanOfGroup');

    t(function(name, cb){
		client[name].call(client, rid, from, timeout, cb);
    }, 'isBanOfRoom');

    t(function(name, cb){
		client[name].call(client, from, timeout, cb);
    }, 'isProjectBlack');

    t(function(name, cb){
		client[name].call(client, from, lat, lng, timeout, cb);
    }, 'setGeo');

    t(function(name, cb){
		client[name].call(client, from, timeout, cb);
    }, 'getGeo');

    t(function(name, cb){
		client[name].call(client, [from, to], timeout, cb);
    }, 'getGeos');

    t(function(name, cb){
		client[name].call(client, from, to, 8, file_path, timeout, cb);
    }, 'sendFile');

    t(function(name, cb){
		client[name].call(client, from, 'app-info', 'device-token', timeout, cb);
    }, 'addDevice');

    t(function(name, cb){
		client[name].call(client, from, 'device-token', timeout, cb);
    }, 'removeDevice');

    t(function(name, cb){
		console.log('---------------(' + index + ')end!-----------------');
    });
});

client.on('error', function(err){
    console.error(err);
});

client.on('close', function(){
    console.log('closed!');
});