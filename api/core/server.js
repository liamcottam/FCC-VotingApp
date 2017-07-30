const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const passport = require('passport');
const mongo = require('./mongo');
const api = require('./api');
const compress = require('compression');

const app = express();
const server = require('http').Server(app);
require('./websocket').init(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compress({ threshold: 0 }));
app.use(passport.initialize());
app.use(expressValidator());
app.use('/api/v1', api);

module.exports = { express: app, server: server };
