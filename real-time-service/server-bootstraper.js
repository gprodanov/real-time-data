const http = require('http');
const handler = require('./connection-handling');

module.exports = (config) => {
    const httpServer = http.createServer((req, res) => {
        res.writeHead(426, config.headers);
    });

    const WebSocket = require('ws');
    const socketServer = new WebSocket.Server({ server: httpServer });

    socketServer.on('connection', (conn) => { // 2nd arg "req"
        handler.handleConnection(socketServer, conn);
    });

    socketServer.on('error', err => {
        console.error('server error: ' + err.message);
    });

    socketServer.on('listening', () => {
        console.log(`socket server listening on ${config.host}:${config.port}...`);
    });

    httpServer.listen(config.port);
    return socketServer;
};
