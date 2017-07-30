const router = require('express').Router();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

router.use('/auth', require('./auth'));
router.use('/polls', require('./polls'));
router.use('/profiles', require('./profiles'));
router.use('/account', require('./account'));

router.use((err, req, res, next) => {
  if (err.name === 'ManuallyHandled') return next(false);

  if (err.name === 'InputValidationError') {
    var response = { name: err.name };
    if (err.msg) {
      response.msg = err.msg;
    } else if (err.errors) {
      response.errors = err.errors.map((item) => {
        if (item.msg === 'required') {
          return { msg: `${item.param} is required` };
        }
        return {
          param: item.param,
          msg: item.msg,
        }
      });
    }
    return res.status(422).json(response);
  }

  if (err.name === 'UnauthorizedError') {
    switch (err.message) {
      case 'InvalidPassword':
        return res.status(401).json({
          error: err.name,
          msg: 'Invalid Password',
        });
        break;
      case 'invalid token':
        return res.status(401).json({
          msg: 'Invalid token'
        });
        break;
      case 'jwt expired':
        return res.status(401).json({
          msg: 'Your token has expired'
        });
        break;
      default:
        return res.status(401).json({
          error: 'Unauthorized'
        });
    }
  }

  if (err.name === 'NotFound') {
    return res.status(404).json(err);
  }

  if (err.name === 'NoContent') {
    return res.status(204).end();
  }

  console.error('UNHANDLED EXCEPTION');
  console.error(err);
  return res.status(500).json({ name: 'UnhandledException' });
});

router.use((req, res, next) => {
  res.status(404).json({ name: 'NotFound', msg: 'Could not find resource requested' });
});

module.exports = router;
