'use strict'

const path = require('path');
const fs = require('fs');
const msgpack = require('msgpack5')();
const RTMClient = require('./src/rtm/RTMClient');

let client = new RTMClient({ host: '35.167.185.139', port: 13013, autoReconnect: true, connectionTimeout: 10 * 1000 });

// client.enableConnect();

let filePath = path.resolve(__dirname, 'key/test-secp256k1-compressed-public.key');

let options = {
    curveName: null,
    strength: 128,
    streamMode: false
}
client.enableEncryptorByFile(filePath, options);

client.on('connect', () => {
    console.log('connect!');
    // client.sendMessage();
});

client.on('error', (err) => {
    console.error(err);
});
