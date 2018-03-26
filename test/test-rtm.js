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
    pid: 1000012,
    secretKey: 'bbeb2fc2-b2d5-4855-925d-e554e1195ce6'
});

let filePath = path.resolve(__dirname, '../key/test-secp256k1-compressed-public.key');

let options = {
    curveName: null,
    strength: 128,
    streamMode: false
}

client.enableConnect();
// client.enableEncryptorByFile(filePath, options);

client.on('connect', (data) => {
    console.log('connect!\n\n');

    let step = 2;
    let index = 0;

    let t = (fn, name) => {
        setTimeout(()=>{
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
    
    t((name, cb) => {
		console.log('---------------begin!-----------------')
    });
    
    t((name, cb) => {
		client[name].call(client, from, to, 8, 'hello !', '', cb);
    }, 'sendMessage');

    t((name, cb) => {
		client[name].call(client, from, tos, 8, 'hello !', '', cb);
    }, 'sendMessages');

    t((name, cb) => {
		client[name].call(client, from, gid, 8, 'hello !', '', cb);
    }, 'sendGroupMessage');

    t((name, cb) => {
		client[name].call(client, from, rid, 8, 'hello !', '', cb);
    }, 'sendRoomMessage');
    
    t((name, cb) => {
		client[name].call(client, from, 8, 'hello !', '', cb);
    }, 'broadcastMessage');

    t((name, cb) => {
		client[name].call(client, from, friends, cb);
    }, 'addFriends');

    t((name, cb) => {
		client[name].call(client, from, [new Int64BE(0, 778899)], cb);
    }, 'deleteFriends');

    t((name, cb) => {
		client[name].call(client, from, cb);
    }, 'getFriends');

    t((name, cb) => {
		client[name].call(client, from, fuid, cb);
    }, 'isFriend');

    t((name, cb) => {
		client[name].call(client, from, friends, cb);
    }, 'isFriends');

    t((name, cb) => {
		client[name].call(client, gid, [from, to], cb);
    }, 'addGroupMembers');

    t((name, cb) => {
		client[name].call(client, gid, [to], cb);
    }, 'deleteGroupMembers');

    t((name, cb) => {
		client[name].call(client, gid, cb);
    }, 'getGroupMembers');

    t((name, cb) => {
		client[name].call(client, gid, from, cb);
    }, 'isGroupMember');

    t((name, cb) => {
		client[name].call(client, from, cb);
    }, 'getUserGroups');

    t((name, cb) => {
		client[name].call(client, gid, cb);
    }, 'deleteGroup');

    t((name, cb) => {
		client[name].call(client, from, cb);
    }, 'getToken');

    t((name, cb) => {
		client[name].call(client, tos, cb);
    }, 'getOnlineUsers');

    t((name, cb) => {
		client[name].call(client, gid, to, 1, cb);
    }, 'addGroupBan');

    t((name, cb) => {
		client[name].call(client, gid, to, cb);
    }, 'removeGroupBan');

    t((name, cb) => {
		client[name].call(client, rid, to, 1, cb);
    }, 'addRoomBan');

    t((name, cb) => {
		client[name].call(client, rid, to, cb);
    }, 'removeRoomBan');

    t((name, cb) => {
		client[name].call(client, from, 1, cb);
    }, 'addProjectBlack');

    t((name, cb) => {
		client[name].call(client, from, cb);
    }, 'removeProjectBlack');

    t((name, cb) => {
		client[name].call(client, gid, from, cb);
    }, 'isBanOfGroup');

    t((name, cb) => {
		client[name].call(client, rid, from, cb);
    }, 'isBanOfRoom');

    t((name, cb) => {
		client[name].call(client, from, cb);
    }, 'isProjectBlack');

    t((name, cb) => {
		client[name].call(client, from, 'test-user', cb);
    }, 'setPushName');

    t((name, cb) => {
		client[name].call(client, from, cb);
    }, 'getPushName');

    t((name, cb) => {
		client[name].call(client, from, lat, lng, cb);
    }, 'setGeo');

    t((name, cb) => {
		client[name].call(client, from, cb);
    }, 'getGeo');

    t((name, cb) => {
		client[name].call(client, [from, to], cb);
    }, 'getGeos');

    t((name, cb) => {
		client[name].call(client, from, to, 8, file_path, cb);
    }, 'sendFile');

    t((name, cb) => {
		console.log('---------------(' + index + ')end!-----------------');
	});
});

client.on('error', (err) => {
    console.error(err);
});

client.on('close', () => {
    console.error('closed!');
});