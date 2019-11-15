'use strict'

const TestCase = require('./TestCase');

baseTest.call(this);

function baseTest() {

    let tester = new TestCase({
        pid: 11000001,
        secret: 'ef3617e5-e886-4a4e-9eef-7263c0320628',
        host: '52.83.245.22',
        port: 13315,
        reconnect: true,
        timeout: 20 * 1000,
        debug: true
    });
}