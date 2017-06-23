const _ = require('lodash');
const events = require('events');
const msgManager = require('./connection-manager');
const utils = require('./utils');
const nsq = require('nsqjs');

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
        if (!parsedMsg) {
            return console.log(`Error parsing message, ${msg}`);
        }

        if (parsedMsg.action === 'broadcast') {
            msgManager.sendBroadcast(parsedMsg);
        } else {
            msgManager.sendMessageForTopic(parsedMsg, parsedMsg);
        }

        msg.finish();
    });

    // TODO: for testing purposes only, remove
    // setInterval(() => {
    //     msgManager.sendMessageForTopic('test.test.test', { test: 123 });
    // }, 5000);

    reader.connect();
    return reader;
};
