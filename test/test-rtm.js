'use strict'

const path = require('path');
const fs = require('fs');
const msgpack = require("msgpack-lite");
const Int64BE = require("int64-buffer").Int64BE;

const RTMClient = require('../src/rtm/RTMClient');
const PromiseClient = require('../src/rtm/PromiseClient');

let self = this;

let client = new RTMClient({ 
    host: '35.167.185.139',
    port: 13315,
    autoReconnect: false,
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

client.on('connect', function(data){
    console.log('connect!\n\n');

    let step = 2;
    let index = 0;

    let t = function(fn, name){
        setTimeout(function(){
            var cb = function(err, data){
                if (err){
                    console.error('\n[ERR] ' + name + ':\n', err)
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

    let file_path = path.resolve(__dirname, '../key/test-secp256k1-public.pem');

    t(function(name, cb){
		console.log('---------------begin!-----------------')
    });

    t(function(name, cb){
		client[name].call(client, true, cb);
    }, 'setEvtListener');

    t(function(name, cb){
		client[name].call(client, false, cb);
    }, 'setEvtListener');

    t(function(name, cb){
		client[name].call(client, { gids:[gid], rids:[], p2p:false, events:[] }, cb);
    }, 'setEvtListener');

    t(function(name, cb){
		client[name].call(client, { rids:[rid], p2p:true, events:['login', 'logout'] }, cb);
    }, 'addEvtListener');

    t(function(name, cb){
		client[name].call(client, { events:['login'] }, cb);
    }, 'removeEvtListener');
    
    t(function(name, cb){
		client[name].call(client, from, to, 8, 'hello !', '', cb);
    }, 'sendMessage');

    t(function(name, cb){
		client[name].call(client, from, tos, 8, 'hello !', '', cb);
    }, 'sendMessages');

    t(function(name, cb){
		client[name].call(client, from, gid, 8, 'hello !', '', cb);
    }, 'sendGroupMessage');

    t(function(name, cb){
		client[name].call(client, from, rid, 8, 'hello !', '', cb);
    }, 'sendRoomMessage');
    
    t(function(name, cb){
		client[name].call(client, from, 8, 'hello !', '', cb);
    }, 'broadcastMessage');

    t(function(name, cb){
		client[name].call(client, from, friends, cb);
    }, 'addFriends');

    t(function(name, cb){
		client[name].call(client, from, [new Int64BE(0, 778899)], cb);
    }, 'deleteFriends');

    t(function(name, cb){
		client[name].call(client, from, cb);
    }, 'getFriends');

    t(function(name, cb){
		client[name].call(client, from, fuid, cb);
    }, 'isFriend');

    t(function(name, cb){
		client[name].call(client, from, friends, cb);
    }, 'isFriends');

    t(function(name, cb){
		client[name].call(client, gid, [from, to], cb);
    }, 'addGroupMembers');

    t(function(name, cb){
		client[name].call(client, gid, [to], cb);
    }, 'deleteGroupMembers');

    t(function(name, cb){
		client[name].call(client, gid, cb);
    }, 'getGroupMembers');

    t(function(name, cb){
		client[name].call(client, gid, from, cb);
    }, 'isGroupMember');

    t(function(name, cb){
		client[name].call(client, from, cb);
    }, 'getUserGroups');

    t(function(name, cb){
		client[name].call(client, gid, cb);
    }, 'deleteGroup');

    t(function(name, cb){
		client[name].call(client, from, cb);
    }, 'getToken');

    t(function(name, cb){
		client[name].call(client, tos, cb);
    }, 'getOnlineUsers');

    t(function(name, cb){
		client[name].call(client, gid, to, 1, cb);
    }, 'addGroupBan');

    t(function(name, cb){
		client[name].call(client, gid, to, cb);
    }, 'removeGroupBan');

    t(function(name, cb){
		client[name].call(client, rid, to, 1, cb);
    }, 'addRoomBan');

    t(function(name, cb){
		client[name].call(client, rid, to, cb);
    }, 'removeRoomBan');

    t(function(name, cb){
		client[name].call(client, from, 1, cb);
    }, 'addProjectBlack');

    t(function(name, cb){
		client[name].call(client, from, cb);
    }, 'removeProjectBlack');

    t(function(name, cb){
		client[name].call(client, gid, from, cb);
    }, 'isBanOfGroup');

    t(function(name, cb){
		client[name].call(client, rid, from, cb);
    }, 'isBanOfRoom');

    t(function(name, cb){
		client[name].call(client, from, cb);
    }, 'isProjectBlack');

    t(function(name, cb){
		client[name].call(client, from, 'test-user', cb);
    }, 'setPushName');

    t(function(name, cb){
		client[name].call(client, from, cb);
    }, 'getPushName');

    t(function(name, cb){
		client[name].call(client, from, lat, lng, cb);
    }, 'setGeo');

    t(function(name, cb){
		client[name].call(client, from, cb);
    }, 'getGeo');

    t(function(name, cb){
		client[name].call(client, [from, to], cb);
    }, 'getGeos');

    t(function(name, cb){
		client[name].call(client, from, to, 8, file_path, cb);
    }, 'sendFile');

    t(function(name, cb){
		console.log('---------------(' + index + ')end!-----------------');
    });
    
    //receive from server
    let pushName = data.services.recvMessage;
    data.processor.on(pushName, function(data){
        console.log('\n[PUSH] ' + pushName + ':\n', data);
    });
});

client.on('error', function(err){
    console.error(err);
});

client.on('close', function(){
    console.error('closed!');
});