const handler = require('./connection-handling');

module.exports = (config) => {
    const WebSocket = require('ws');
    const server = new WebSocket.Server(config);

    server.on('connection', (conn) => { // 2nd arg "req"
        handler.handleConnection(server, conn);
    });

    server.on('error', err => {
        console.error('server error: ' + err.message);
    });

    server.on('listening', () => {
        console.log('socket server listening...');
    });

    return server;
};
