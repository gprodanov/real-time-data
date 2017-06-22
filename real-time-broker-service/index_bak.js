const express = require('express');
const bodyParser = require('body-parser');
const RedisMq = require('rsmq');

const app = express();
app.use(bodyParser.json());

const mq = new RedisMq({
    host: 'gngeorgievlnx.bedford.progress.com',
    port: 6379,
    ns: 'messages'
});

const queues = {};

mq.createQueue(
    {
        qname: 'messages'
    },
    () => {
        app.listen(8013, () => console.log('listening on 8013'));
    }
);

app.post('/publish', (req, res) => {
    const body = req.body;

    mq.sendMessage(
        {
            qname: 'messages',
            message: JSON.stringify(req.body)
        },
        err => {
            if (err) {
                return console.error(err);
            }

            console.log(`Send message : ${JSON.stringify(req.body)}`);
        }
    );
});
