const router = require('express').Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: true
  }),
  (req, res) => {
    res.status(200).json({ message: 'OAuth login successful.', user: req.user });
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
  res.status(200).json(req.user);
});

module.exports = router;
