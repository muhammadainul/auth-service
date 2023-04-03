const express = require('express');
const app = express();

require('dotenv').config();

global.config = require('./config/config')[process.env.NODE_ENV];

// const io = require('socket.io-client');
// global.socket = io('http://localhost:3010', { 
//     transports : ['websocket']
// });

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, simandesk_token'
    );
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return res.status(200).json({});
    }
    next();
});

app.use('/v1', require('./controllers/v1/index'));

module.exports = app;