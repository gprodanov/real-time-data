const _ = require('lodash');
const RedisSMQ = require('rsmq');
const msgManager = require('./connection-manager');
const utils = require('./utils');

module.exports = (config) => {
    let intervalId;
    const queue = new RedisSMQ(config);
    queue.stop = () => {
        clearInterval(intervalId);
    };

    intervalId = setInterval(() => {
        queue.receiveMessage({ qname: config.topic }, function (err, resp) {
            if (!resp.id) {
                return;
            }

            let data = utils.safeParseJson(resp.message);
            console.log('Message data: ', data);
            if (data) {
                msgManager.sendMessageForTopic(data, resp.message);
            }

            queue.deleteMessage({ qname: config.topic, id: resp.id }, function (err, resp) {
                if (resp === 1) {
                    console.log('Message deleted.');
                } else {
                    console.log('Message not found.');
                }
            });
        });
    }, 100);

    return queue;
};
