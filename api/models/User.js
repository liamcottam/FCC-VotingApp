const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  github_id: {
    type: String,
    required: false,
  },
  display_name: {
    type: String,
    required: false,
  },
});

UserSchema.methods.checkPassword = function (password, callback) {
  return bcrypt.compareSync(password, this.password_hash);
}

UserSchema.methods.generateJWT = function () {
  var today = new Date();
  //var exp = new Date(today);
  //exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    username: this.username,
    //exp: parseInt(exp.getTime() / 1000),
  }, process.env.SECRET);
};

UserSchema.methods.toAuthJSON = function (isNew) {
  let res = {};
  if (isNew) res.new = true;
  res.userdata = { id: this._id };
  if (this.github_id && this.display_name) {
    res.userdata.username = this.display_name;
    res.userdata.is_oauth = true;
  } else {
    res.userdata.username = this.username;
  }
  res.token = this.generateJWT();
  return res;
};

UserSchema.methods.login = function (password) {
  return new Promise((resolve, reject) => {
    if (this.checkPassword(password, this.password_hash)) {
      return resolve(this.toAuthJSON());
    } else {
      return reject({ name: 'UnauthorizedError', message: 'InvalidPassword' });
    }
  });
};

UserSchema.statics.calculatePassword = function (password) {
  let salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

UserSchema.statics.create = function (username, password) {
  const self = this;
  return new Promise((resolve, reject) => {
    const user = new self();
    user.username = username;
    user.password_hash = this.calculatePassword(password);
    user.save().then(() => {
      return resolve(user.toAuthJSON(true));
    }).catch((err) => {
      return reject(err);
    });
  });
};

module.exports = mongoose.model('User', UserSchema);
