const _ = require('lodash');
const events = require('events');
const msgManager = require('./connection-manager');
const utils = require('./utils');
const nsq = require('nsqjs');

function Queue(config) {
    this.emitter = new events.EventEmitter();
    config.nsqd = [`${config.host}:${config.port}`];

    var reader = new nsq.Reader('messages', 'ingestion', {
        nsqdTCPAddresses: ['192.168.130.50:4151']
    });

    reader.connect();

    reader.on('error', err => {
        console.log(err.stack);
    });

    reader.on('message', msg => {
        const parsedMsg = utils.safeParseJson(msg.body.toString());
        this.emitter.emit('message', parsedMsg);
    });
}

Queue.prototype = {
    onData(callback) {
        this.emitter.on('message', callback);
    }
};

module.exports = config => {
    const nsqdAddr = `${config.host}:${config.port}`;

    var reader = new nsq.Reader(config.topic, config.channel, {
        nsqdTCPAddresses: [nsqdAddr]
    });

    reader.on(nsq.Reader.NSQD_CONNECTED, () => {
        console.log('queue connected');
    });

    reader.on(nsq.Reader.NSQD_CLOSED, () => {
        console.log('queue closed');
    });

    reader.on(nsq.Reader.ERROR, err => {
        console.log(err.stack);
    });

    reader.on(nsq.Reader.MESSAGE, msg => {
        console.log('got msg from queue: ' + msg.body.toString());
        const parsedMsg = utils.safeParseJson(msg.body.toString());
        if (parsedMsg) {
            msgManager.sendMessageForTopic(parsedMsg, parsedMsg);
        }
    });

    // for testing purposes only
    // setInterval(() => {
    //     msgManager.sendMessageForTopic('test.test.test', { test: 123 });
    // }, 5000);

    reader.connect();
    return reader;
};
