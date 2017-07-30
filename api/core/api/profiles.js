const router = require('express').Router();
const auth = require('../auth');

const User = require('../../models/User');
const Poll = require('../../models/Poll');

router.use((req, res, next) => {
  req.ip_addr = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].split(':').slice(-1)[0];
  next();
});

// Get profile
router.get('/:id', auth.optional, (req, res, next) => {
  req.assert('id', 'invalid id').isAlphanumeric().matches(/^[a-f\d]{24}$/i);

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) throw { name: 'InputValidationError', errors: result.array() };
      return User.findById(req.params.id, { _id: 1, username: 1 }).exec();
    })
    .then((user) => {
      if (user) {
        Poll.findByUserId(user, req, res, next);
      } else {
        throw { name: 'NotFound', errors: { id: `could not find profile with id ${req.params.id}` } };
      }
    }).catch(next);
});

module.exports = router;
