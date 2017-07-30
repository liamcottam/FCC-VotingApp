const mongoose = require('mongoose');
const findIndex = require('array.prototype.findindex');
findIndex.shim();
const Schema = mongoose.Schema;

var PollSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,

    index: {
      unique: true,
      dropDups: true
    },
  },
  options: {
    type: Array,
    required: true,
  },
  voted_by: {
    type: Array,
    required: false,
  },
}, {
    timestamps: true,
  });

PollSchema.index({ "createdAt": 1 });
PollSchema.index({ "updatedAt": 1 });

PollSchema.statics.findByUserId = function (user, req, res, next) {
  this.find({ owner: req.params.id }, { __v: 0 }).sort({ $natural: -1 }).then((data) => {
    if (data.length === 0) throw { name: 'NoContent' };
    var response = [];

    data.forEach(function (poll) {
      var obj = {};
      obj._id = poll._id;
      obj.question = poll.question;

      var user_voted_index = poll.voted_by.findIndex(o => o.username === user.username);
      var voted_index = poll.voted_by.findIndex(o => o.ip === req.ip_addr);
      if (user_voted_index !== -1 && voted_index !== -1 && user_voted_index !== voted_index) {
        obj.user_voted_for = poll.options[poll.voted_by[user_voted_index].option].text;
      }
      if (voted_index !== -1) {
        obj.voted_for = poll.options[poll.voted_by[voted_index].option].text;
      }
      obj.votes = poll.voted_by.length;

      if (obj.votes !== 0) {
        poll.options.forEach(option => {
          if (option.votes !== 0 && (!obj.most_popular || option.votes > obj.most_popular.votes)) {
            obj.most_popular = option;
            obj.most_popular.percent = ((obj.most_popular.votes / obj.votes) * 100).toFixed(2);
          }
        });
      }

      response.push(obj);
    });

    res.json(response);
  }).catch(next);
};

module.exports = mongoose.model('Poll', PollSchema);
