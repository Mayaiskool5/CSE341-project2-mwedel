const router = require('express').Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/auth');
const authController = require('../controllers/auth');
const { loginValidationRules, registrationValidationRules, validate } = require('../middleware/validate');

const sanitizeUser = user => {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
};

router.post('/register', registrationValidationRules(), validate, authController.registerLocal);

router.post('/login', loginValidationRules(), validate, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || 'Login failed.' });

    req.logIn(user, err => {
      if (err) return next(err);
      res.status(200).json({ message: 'Login successful.', user: sanitizeUser(user) });
    });
  })(req, res, next);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: true
  }),
  (req, res) => {
    res.status(200).json({ message: 'OAuth login successful.', user: sanitizeUser(req.user) });
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'OAuth login failed.' });
});

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully.' });
    });
  });
});

router.get('/me', ensureAuthenticated, (req, res) => {
  res.status(200).json(sanitizeUser(req.user));
});

module.exports = router;
