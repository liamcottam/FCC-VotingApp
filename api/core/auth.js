var jwt = require('express-jwt');

function getTokenFromHeader(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

var auth = {
  required: jwt({
    secret: process.env.SECRET,
    userProperty: 'token',
    credentialsRequired: true,
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: process.env.SECRET,
    userProperty: 'token',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  }),
};

module.exports = auth;
