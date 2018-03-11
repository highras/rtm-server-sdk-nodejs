'use strict'

const path = require('path');
const fs = require('fs');
const defer = require('co-defer');
const wait = require('co-wait');
const msgpack = require("msgpack-lite");
const Uint64BE = require("int64-buffer").Uint64BE;

const RTMClient = require('./src/rtm/RTMClient');

let client = new RTMClient({ 
    host: '117.50.4.158', 
    port: 13315, 
    autoReconnect: false,
    connectionTimeout: 10 * 1000,
    pid: 1000001,
    secretKey: '3a0023b6-bc80-488d-b312-c4a139b5ab1a'
});

let filePath = path.resolve(__dirname, 'key/test-secp256k1-compressed-public.key');

let options = {
    curveName: null,
    strength: 128,
    streamMode: false
}

client.enableConnect();
// client.enableEncryptorByFile(filePath, options);

client.on('connect', () => {
    console.log('connect!');

    defer.nextTick(function *(){
        let from = new Uint64BE(0, 778898);
        let to = new Uint64BE(0, 778899);
        let tos = [new Uint64BE(0, 778899), new Uint64BE(0, 778877)];
        let gid = new Uint64BE(0, 999999);
        let rid = new Uint64BE(0, 666666);
        let friends = [new Uint64BE(0, 778899), new Uint64BE(0, 778877)];
        let fuid = new Uint64BE(0, 778877);
        let lat = 39239.1123;
        let lng = 69394.4850;

        let file_path = path.resolve(__dirname, 'key/test-secp256k1-public.pem');

        console.log('----------------begin!------------------');
        client.sendMessage(from, to, 8, 'hello !', '', (err, data) => {
            console.log('\n', 'sendMessage: ', data, err);
        });

        yield wait(2000);
        client.sendMessages(from, tos, 8, 'hello !', '', (err, data) => {
            console.log('\n', 'sendMessages: ', data, err);
        });

        yield wait(2000);
        client.sendGroupMessage(from, gid, 8, 'hello !', '', (err, data) => {
            console.log('\n', 'sendGroupMessage: ', data, err);
        });

        yield wait(2000);
        client.sendRoomMessage(from, rid, 8, 'hello !', '', (err, data) => {
            console.log('\n', 'sendRoomMessage: ', data, err);
        });

        yield wait(2000);
        client.broadcastMessage(from, 8, 'hello !', '', (err, data) => {
            console.log('\n', 'broadcastMessage: ', data, err);
        });

        yield wait(2000);
        client.addfriends(from, friends, (err, data) => {
            console.log('\n', 'addfriends: ', data, err);
        });

        yield wait(2000);
        client.delFriends(from, [new Uint64BE(0, 778899)], (err, data) => {
            console.log('\n', 'delFriends: ', data, err);
        });

        yield wait(2000);
        client.getFriends(from, (err, data) => {
            console.log('\n', 'getFriends: ', data, err);
            // console.log(data[0] && data[0].toString());
        });

        yield wait(2000);
        client.isFriend(from, fuid, (err, data) => {
            console.log('\n', 'isFriend: ', data, err);
        });

        yield wait(2000);
        client.isFriends(from, friends, (err, data) => {
            console.log('\n', 'isFriends: ', data, err);
            // console.log(data[0] && data[0].toString());
        });

        yield wait(2000);
        client.addGroupMembers(gid, [from, to], (err, data) => {
            console.log('\n', 'addGroupMembers: ', data, err);
        });

        yield wait(2000);
        client.deleteGroupMembers(gid, [to], (err, data) => {
            console.log('\n', 'deleteGroupMembers: ', data, err);
        });

        yield wait(2000);
        client.getGroupMembers(gid, (err, data) => {
            console.log('\n', 'getGroupMembers: ', data, err);
            // console.log(data[0] && data[0].toString());
        });

        yield wait(2000);
        client.isGroupMember(gid, from, (err, data) => {
            console.log('\n', 'isGroupMember: ', data, err);
        });

        yield wait(2000);
        client.getUserGroups(from, (err, data) => {
            console.log('\n', 'getUserGroups: ', data, err);
            // console.log(data[0] && data[0].toString());
        });

        yield wait(2000);
        client.deleteGroup(gid, (err, data) => {
            console.log('\n', 'deleteGroup: ', data, err);
        });

        yield wait(2000);
        client.getToken(from, (err, data) => {
            console.log('\n', 'getToken: ', data, err);
        });

        yield wait(2000);
        client.getOnlineUsers(tos, (err, data) => {
            console.log('\n', 'getOnlineUsers: ', data, err);
            // console.log(data[0] && data[0].toString());
        });

        yield wait(2000);
        client.addGroupBan(gid, to, 1, (err, data) => {
            console.log('\n', 'addGroupBan: ', data, err);
        });

        yield wait(2000);
        client.removeGroupBan(gid, to, (err, data) => {
            console.log('\n', 'removeGroupBan: ', data, err);
        });

        yield wait(2000);
        client.addRoomBan(rid, to, 1, (err, data) => {
            console.log('\n', 'addRoomBan: ', data, err);
        });

        yield wait(2000);
        client.removeRoomBan(rid, to, (err, data) => {
            console.log('\n', 'removeRoomBan: ', data, err);
        });

        yield wait(2000);
        client.addProjectBlack(from, 1, (err, data) => {
            console.log('\n', 'addProjectBlack: ', data, err);
        });

        yield wait(2000);
        client.removeProjectBlack(from, (err, data) => {
            console.log('\n', 'removeProjectBlack: ', data, err);
        });

        yield wait(2000);
        client.isBanOfGroup(gid, from, (err, data) => {
            console.log('\n', 'isBanOfGroup: ', data, err);
        });

        yield wait(2000);
        client.isBanOfRoom(rid, from, (err, data) => {
            console.log('\n', 'isBanOfRoom: ', data, err);
        });

        yield wait(2000);
        client.isProjectBlack(from, (err, data) => {
            console.log('\n', 'isProjectBlack: ', data, err);
        });

        yield wait(2000);
        client.setPushName(from, 'test-user', (err, data) => {
            console.log('\n', 'setPushName: ', data, err);
        });

        yield wait(2000);
        client.getPushName(from, (err, data) => {
            console.log('\n', 'getPushName: ', data, err);
        });

        yield wait(2000);
        client.setGeo(from, lat, lng, (err, data) => {
            console.log('\n', 'setGeo: ', data, err);
        });

        yield wait(2000);
        client.getGeo(from, (err, data) => {
            console.log('\n', 'getGeo: ', data, err);
        });

        yield wait(2000);
        client.getGeos([from, to], (err, data) => {
            console.log('\n', 'getGeos: ', data, err);
        });

        yield wait(2000);
        client.sendFile(from, to, 8, file_path, (err, data) => {
            console.log('\n', 'sendFile: ', data, err);
        });

        yield wait(2000);
        console.log('----------------end!------------------');
    });
});

client.on('error', (err) => {
    console.error(err);
});
