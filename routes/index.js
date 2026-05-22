const router = require('express').Router();

router.use('/items', require('./items'));
router.use('/', require('./swagger' ));

module.exports = router;