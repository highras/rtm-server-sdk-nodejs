'use strict'

const TestCase = require('./TestCase');
const AsyncStressTester = require('./AsyncStressTester');

// case 1
baseTest.call(this);

// case 2
// asyncStressTest.call(this);



function baseTest() {

    let tester = new TestCase({
        host: '35.167.185.139',
        port: 13315,
        autoReconnect: true,
        connectionTimeout: 5 * 1000,
        pid: 11000001,
        secretKey: 'ef3617e5-e886-4a4e-9eef-7263c0320628'
    });
}

function asyncStressTest() {

    let tester = new AsyncStressTester({
        host: '35.167.185.139',
        port: 13013,
        autoReconnect: true,
        connectionTimeout: 20 * 1000,
        pid: 0,
        secretKey: ''
    });

    tester.buildTesters(1, 150);

    tester.launch();
    tester.showStatistics();
}
