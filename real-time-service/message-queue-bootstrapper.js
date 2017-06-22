const _ = require('lodash');
const events = require('events');
const msgManager = require('./connection-manager');
const utils = require('./utils');
const nsq = require('nsq.js');

function Queue() {
    this.emitter = new events.EventEmitter();

    var reader = nsq.reader({
        nsqd: ['192.168.130.50:4150'],
        maxInFlight: 1,
        maxAttempts: 5,
        topic: 'messages',
        channel: 'ingestion'
    });

    reader.on('error', err => {
        console.log(err.stack);
    });

    reader.on('message', msg => {
        this.emitter.emit('message', JSON.parse(msg.body.toString()));
    });
}

Queue.prototype = {
    onData(callback) {
        this.emitter.on('message', callback);
    }
};

module.exports = config => {
    return new Queue();
};
