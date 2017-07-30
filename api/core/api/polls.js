const router = require('express').Router();
const auth = require('../auth');
const findIndex = require('array.prototype.findindex');
findIndex.shim();

const Poll = require('../../models/Poll');

router.use((req, res, next) => {
  req.ip_addr = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].split(':').slice(-1)[0];
  next();
});

// Get all polls
router.get('/', auth.optional, (req, res, next) => {
  Poll.find({}, { __v: 0 }).sort({ createdAt: -1 }).then((data) => {
    if (data.length === 0) throw { name: 'NoContent' };

    var response = [];
    data.forEach(function (poll) {
      var obj = {};
      obj._id = poll._id;
      obj.question = poll.question;

      if (req.token && poll.owner == req.token.id) {
        obj.owner = true;
      }

      var voted_index = poll.voted_by.findIndex(o => o.ip === req.ip_addr);
      if (voted_index !== -1) {
        obj.voted_for = poll.options[poll.voted_by[voted_index].option].text;
      }
      obj.votes = poll.voted_by.length;

      if (obj.votes) {
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
});

// Get Poll
router.get('/:id', auth.optional, (req, res, next) => {
  Poll.findOne({ _id: req.params.id }, { __v: 0 }).then((poll) => {
    if (poll) {
      var obj = {};
      obj._id = poll._id;
      obj.question = poll.question;
      obj.options = poll.options;

      if (req.token && poll.owner == req.token.id) {
        obj.owner = true;
      }

      var voted_index = poll.voted_by.findIndex(o => o.ip === req.ip_addr);
      if (voted_index !== -1) {
        obj.voted_for = poll.voted_by[voted_index].option;
      }
      obj.votes = poll.voted_by.length;

      var most_popular = null;
      obj.options.forEach(option => {
        if (option.votes !== 0 && (most_popular === null || option.votes > most_popular.votes)) {
          most_popular = Object.assign({}, option);
          most_popular.percent = ((most_popular.votes / obj.votes) * 100).toFixed(2);
        }
      });

      res.json(obj);
    } else {
      res.status(404).end();
    }
  }).catch(next);
});


// Create Poll
router.post('/', auth.required, (req, res, next) => {
  req.assert('question', 'required').notEmpty();
  req.assert('options', 'required').notEmpty();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) throw { name: 'InputValidationError', errors: result.array() };

      // Initial validation check
      if (typeof req.body.question !== 'string') {
        throw {
          name: 'ValidationError',
          msg: 'Invalid question type, should be a string',
        };
      }
      if (typeof req.body.options !== 'string' && !Array.isArray(req.body.options)) {
        throw {
          name: 'ValidationError',
          msg: 'Invalid options type, should be \r\n limited or an array',
        };
      }

      if (!Array.isArray(req.body.options)) {
        req.body.options = req.body.options.split(/(\r\n|\n|\r)/g); // Split by newlines/returns if string
      }

      const question = req.body.question.trim().replace(/\s\s+/g, ' ') // Remove multiple spaces with one and trim ends
      let options = req.body.options
        .map(s => s.trim().replace(/\s\s+/g, ' '))  // Remove multiple spaces with one and trim ends
        .filter(s => s.length >= 1)                 // Check for empty entries
        .filter((s, i, a) => a.indexOf(s) === i)    // Remove duplicates
        .map(o => ({ text: o, votes: 0 }));         // Map to Vote object

      // Ensure there is at least two options
      if (options.length < 2) {
        throw {
          name: 'InputValidationError',
          msg: 'At least two unique options are required'
        };
      }

      // Check no poll with the title exists
      Poll.findOne({ question: question }, { _id: 1 }).then((poll) => {
        if (!poll) {
          return new Poll({ question: question, options: options, owner: req.token.id }).save();
        } else {
          res.status(409).json({
            name: 'AlreadyExists',
            msg: 'A poll with that question already exists',
            redirect: `${req.baseUrl}${req.url}${poll._id}`,
          });
          return null;
        }
      }).then((poll) => {
        if (poll !== null) {
          return res.json({ id: poll._id });
        }
      }).catch(next);
    }).catch(next);
});

// Update Poll (add options and vote)
router.patch('/:id', auth.optional, (req, res, next) => {
  Poll.findOne({ _id: req.params.id }).then((poll) => {
    if (!poll) throw { name: 'NotFound' };

    if (poll.voted_by.findIndex(o => o.ip === req.ip_addr) === -1) {
      let index = poll.options.findIndex(o => o.text === req.body.selected);
      let update = { $push: { voted_by: { ip: req.ip_addr, username: (req.token && req.token.username) ? req.token.username : null, option: index } }, $inc: {} };
      if (index === -1) {
        Poll.findOneAndUpdate({ _id: req.params.id }, { $push: { options: { text: req.body.selected, votes: 0 } } }, { new: true }, (err, poll) => {
          if (err || poll.voted_by.findIndex(o => o.ip === req.ip_addr) !== -1) {
            return res.status(401).end();
          }

          index = poll.options.findIndex(o => o.text === req.body.selected);
          update = { $push: { voted_by: { ip: req.ip_addr, option: index, username: (req.token && req.token.username) ? req.token.username : null } }, $inc: {} };
          update.$inc[`options.${index}.votes`] = 1;
          Poll.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, function (err, poll) {
            if (err) {
              console.error(err);
              return res.status(500).end();
            }

            console.log(`emitting to ${req.params.id}`);
            res.status(200).end();
            require('../websocket').getInstance().to(req.params.id).emit('data', { index: index, votes: poll.options[index].votes, option: req.body.selected });
          });
        });
      } else {
        update.$inc[`options.${index}.votes`] = 1;
        Poll.findOneAndUpdate({ _id: req.params.id }, update, { new: true }, function (err, poll) {
          if (err) {
            console.error(err);
            return res.status(500).end();
          }

          console.log(`emitting to ${req.params.id}`);
          res.status(200).end();
          require('../websocket').getInstance().to(req.params.id).emit('data', { index: index, votes: poll.options[index].votes });
        });
      }
    } else {
      res.status(401).json({ msg: 'You have already voted on this poll.' });
    }
  }).catch(next);
});

// Delete Poll
router.delete('/:id', auth.required, (req, res, next) => {
  Poll.findOneAndRemove({ _id: req.params.id, owner: req.token.id }).then((poll) => {
    if (!poll) throw { name: 'NotFound' };
    res.status(200).end();
    require('../websocket').getInstance().to(req.params.id).emit('deleted');
  }).catch(next);
});

module.exports = router;
