const _ = require('lodash');
const constants = require('./constants');
const utils = require('./utils');
const nsq = require('nsqjs');
const connectionsByTopic = {};
const connectionsByid = {};

function _buildTopicName(data) {
    if (data.topic) {
        return data.topic;
    }

    const { appId, contentType, eventKind } = data;
    return `${appId}.${contentType}.${eventKind}`;
}

function _getTopic(descriptor) {
    return _.isObject(descriptor) ? _buildTopicName(descriptor) : descriptor;
}

function connectionIsRegistered(conn) {
    return !!connectionsByid[conn._id];
}

function registerConnection(conn) {
    connectionsByid[conn._id] = conn;
}

function deregisterConnection(conn) {
    _.each(conn._topics, (isSubbed, topic) => {
        if (isSubbed) {
            unsubscribeFromTopic(conn, topic);
        }
    });
    conn.close(undefined, 'closing connection due to unsubscribe');
    delete connectionsByid[conn._id];
}

function subscribeForTopic(conn, data) {
    if (!connectionIsRegistered(conn)) {
        registerConnection(conn);
    }
    const topic = _buildTopicName(data);
    connectionsByTopic[topic] = connectionsByTopic[topic] || [];
    if (!_.some(connectionsByTopic[topic], { _id: conn._id })) {
        connectionsByTopic[topic].push(conn);
        conn._topics = conn._topics || {};
        conn._topics[topic] = true;
    } else {
        console.log('already subbed');
    }
}

function unsubscribeFromTopic(conn, topicData) {
    const topic = _getTopic(topicData);
    if (!connectionsByTopic[topic]) {
        return console.log('no subscribers for this topic');
    }
    connectionsByTopic[topic] = _.reject(connectionsByTopic[topic], {
        _id: conn._id
    });
    if (conn._topics) {
        conn._topics[topic] = false;
    }
}

function getConnectionsByTopic(topicData) {
    const topic = _getTopic(topicData);
    return connectionsByTopic[topic] || [];
}

function sendBroadcast(data) {
    const stringData = JSON.stringify(data);
    getConnectionsByTopic(data).forEach(c => c.send(stringData));
}

function sendMessageForTopic(topicData, obj) {
    const data = _.isString(obj) ? obj : JSON.stringify(obj);
    getConnectionsByTopic(topicData).forEach(conn => conn.send(data));
}

var writer = new nsq.Writer('192.168.130.50', 4150);

writer.connect();

function publishInQueue(data) {
    writer.publish('messages1', data, err => {
        if (err) {
            console.log(err);
        }
    });
}

function onNewMessage(conn, data) {
    if (data.action === constants.msgActions.subscribe) {
        subscribeForTopic(conn, data);
    } else if (data.action === constants.msgActions.unsubscribe) {
        unsubscribeFromTopic(conn, data);
    } else if (data.action === 'broadcast') {
        publishInQueue(data);
    } else {
        console.log('invalid message action');
    }
}

const connManager = {
    onNewMessage: onNewMessage,
    connectionIsRegistered: connectionIsRegistered,
    registerConnection: registerConnection,
    deregisterConnection: deregisterConnection,
    getConnectionsByTopic: getConnectionsByTopic,
    sendMessageForTopic: sendMessageForTopic,
    sendBroadcast: sendBroadcast
};

module.exports = connManager;
