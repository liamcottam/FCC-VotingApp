const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Token = new Schema({
  token: {
    type: String,
    required: true,
  },
  value: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 300,
    default: new Date()
  }
});

Token.statics.createToken = function (value) {
  const self = this;
  return new Promise((resolve, reject) => {
    const rand = crypto.randomBytes(16).toString('hex');
    const token = new self();
    token.token = rand;
    token.value = value;
    token.save(() => {
      resolve({ id: token._id, token: token.token });
    }).catch((err) => {
      reject(err);
    });
  });
};

module.exports = mongoose.model('Token', Token);
