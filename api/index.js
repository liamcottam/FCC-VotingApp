require('dotenv').config();
const path = require('path');
const express = require('express');
const app = require('./core/server');

if (process.env.NODE_ENV === 'production') {
  app.express.get('/favicon.ico', (req, res) => res.status(404).end());
  app.express.use(express.static(path.join(__dirname, 'public'), { maxAge: 31536000000 }));
  app.express.use((req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
    res.sendFile(__dirname + '/public/index.html');
  });

  const listener = app.server.listen(process.env.PORT || 8080, () => {
    console.log(`Server listening on ${listener.address().port}`);
  });
} else {
  module.exports = app;
}
