'use strict'
const path = require('path');
const fs = require('fs');
const TestCase = require('./TestCase');
const RTMServerClient = require('../src/rtm/RTMServerClient');
const Int64BE = require("int64-buffer").Int64BE;

RTMServerClient.RTMRegistration.register();
baseTest.call(this);

function baseTest() {

  

	//构造
	let client = new RTMServerClient({
		pid: 11000002,
		secret: 'xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
		host: 'rtm-intl-backgate.ilivedata.com',
		port: 13315,
		reconnect: true,
		timeout: 20 * 1000,
		debug: true
	});

	//添加监听
	client.on('connect', function() {
		console.log('connected!');
		//发送业务消息
		let from = new Int64BE(0, 1234);
		let to = new Int64BE(0, 5678);
		client.sendMessage(from, to, 8, 'hello !', '', new Int64BE(0), 10 * 1000, function(err, data) {
			if (err) {
                console.log("err callback");
				console.error(err.message);
				return;
			}
			if (data) {
                console.log("ok callback");
				console.log(data);
			}
		});
        
        client.sendMessage(from, to, 8, 'hello !', '', new Int64BE(0), 10 * 1000, function(err, data) {
			if (err) {
                console.log("err callback");
				console.error(err.message);
				return;
			}
			if (data) {
                console.log("ok callback");
				console.log(data);
			}
		});

        console.log("translate 1");
        client.translate('test word', 'en', 'zh-CN', 'chat', 'off', 10 * 1000, function(err, data) {
            console.log("in translate callback");
            if (err) {
                console.log("err callback");
				console.error(err.message);
				return;
			}
			if (data) {
                console.log("ok callback");
				console.log(data);
			}
        });
        console.log("translate 2");

        client.sendMessage(from, to, 8, 'hello !', '', new Int64BE(0), 10 * 1000, function(err, data) {
			if (err) {
                console.log("err callback");
				console.error(err.message);
				return;
			}
			if (data) {
                console.log("ok callback");
				console.log(data);
			}
		});


	});
	client.on('error', function(err) {
		console.error(err.message);
	});
	client.on('close', function() {
		console.log('closed!');
	});

	//添加推送监听
	/*let pushName = RTMConfig.SERVER_PUSH.recvMessage;
	client.processor.on(pushName, function(data) {
		console.log('[PUSH] ' + pushName + ': ', data);
	});*/

	// 开启连接
	client.connect();

	//destroy
	//client.destroy();
	//client = null;
}
