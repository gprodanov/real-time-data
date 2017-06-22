const serverConfig = require('./server-config.json');
const bootstrapServer = require('./bootstrap');
const server = bootstrapServer(serverConfig);

const onStop = () => {
    server.close(() => {
        console.log('server shut down');
        process.exit(0);
    });
};

process.on('SIGINT', () => {
    console.log('Received SIGINT');
    onStop();
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM');
    onStop();
});
