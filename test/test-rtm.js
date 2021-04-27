'use strict'

const TestCase = require('./TestCase');
const RTMServerClient = require('../src/rtm/RTMServerClient');

const FPError = require('../src/fpnn/FPError');

RTMServerClient.RTMRegistration.register();
baseTest.call(this);

function baseTest() {
    
    let tester = new TestCase({
        pid: 11000001,
        secret: 'ef3617e5-e886-4a4e-9eef-7263c0320628',
        host: '161.189.171.91',
        port: 13315,
        reconnect: true,
        timeout: 20 * 1000,
        debug: true
    });
}
