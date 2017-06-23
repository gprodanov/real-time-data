const configs = require('./configs.json');
const bootstrapServer = require('./server-bootstraper');
const server = bootstrapServer(configs.server);
const bootstrapMessageQueue = require('./message-queue-bootstrapper');
const msgQueue = bootstrapMessageQueue(configs.nsq);

const onStop = () => {
    msgQueue.close();

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
