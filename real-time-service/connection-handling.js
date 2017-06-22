const uuid = require('uuid/v1');

const connManager = require('./connection-manager');
const constants = require('./constants');
const utils = require('./utils');
const validation = utils.validation;

function _respond (conn, obj) {
    if (obj.error) {
        return console.log('cancelled respond with error: ' + obj.message);
    }
    conn.send(JSON.stringify(obj));
}

function _closeUnused(conn) {
    if (!conn._wasUsed) {
        conn.close(undefined, 'closing unused connection');
    }
}

function handleConnection (server, conn) {
    conn._id = uuid();
    conn._wasUsed = false;
    setTimeout(() => {
        _closeUnused(conn);
    }, constants.closeUnusedTimeout);

    conn.on('pong', () => conn._isAlive = true);

    conn.on('message', msg => {
        conn._wasUsed = true;
        const data = utils.safeParseJson(msg);

        if (!data) {
            return _respond(conn, {
                error: true, // decide how to differentiate
                message: 'Invalid format'
            });
        }

        const err = validation.validateClientData(data);
        if (err) {
            return _respond(conn, err);
        }
        connManager.onNewMessage(conn, data);
    });

    conn.on('close', () => {
        connManager.deregisterConnection(conn);
    });

    connManager.registerConnection(conn);

    setInterval(() => {
        server.clients.forEach((conn) => {
            if (conn._isAlive === false) {
                return conn.terminate();
            }

            conn._isAlive = false;
            conn.ping('', false, true);
        });
    }, constants.pingInterval);
}

module.exports = {
    handleConnection: handleConnection
};
