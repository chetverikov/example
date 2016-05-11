'use strict';

const oauth2orize = require('oauth2orize');
const mongoose = require('mongoose');
const exchanges = require('./exchanges');
const server = oauth2orize.createServer();

server.exchange('password', oauth2orize.exchange.password(exchanges.password));

server.exchange('client_credentials', oauth2orize.exchange.clientCredentials(exchanges.clientCredentials));

server.exchange('refresh_token', oauth2orize.exchange.refreshToken(exchanges.refreshToken));



module.exports = server;

