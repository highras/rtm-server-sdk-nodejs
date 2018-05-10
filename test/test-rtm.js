'use strict'

const TestCase = require('./TestCase');
const AsyncStressTester = require('./AsyncStressTester');

// case 1
baseTest.call(this);

// case 2
// asyncStressTest.call(this);



function baseTest() {

    let tester = new TestCase({
        host: 'highras-rtm-svrgated.ifunplus.cn',
        port: 13315,
        autoReconnect: true,
        connectionTimeout: 5 * 1000,
        pid: 1017,
        secretKey: '10d09e42-05d3-4d3c-b97a-50c8f27aa6c7'
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

    tester.buildTesters(100, 5000);

    tester.launch();
    tester.showStatistics();
}
