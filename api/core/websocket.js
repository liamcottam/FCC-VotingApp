var instance = null;

exports.init = (server) => {
  instance = require('socket.io')(server);
  instance.on('connection', (client) => {
    console.log('client connected');
    client.on('join', (id) => {
      console.log(`moving client to ${id}`);
      client.leave(client.rooms);
      client.join(id);
    });
    client.on('part', () => {
      console.log('removing client from rooms');
      client.leave(client.rooms);
      client.join('/');
    });
  });
};

exports.getInstance = function () {
  return instance;
};
