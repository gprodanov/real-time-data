const express = require('express');
const bodyParser = require('body-parser');
var nsq = require('nsqjs');

const app = express();
app.use(bodyParser.json());

var writer = new nsq.Writer('192.168.130.50', 4150);

writer.connect();

writer.on('ready', () =>
    app.listen(8013, () => console.log('listening on 8013'))
);

app.post('/publish', (req, res) => {
    const body = req.body;

    writer.publish('messages', JSON.stringify(body), err => {
        if (err) {
            return console.error(err);
        }

        console.log(`Published message: ${JSON.stringify(body)}`);
    });
});
