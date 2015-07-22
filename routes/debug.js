var express = require('express');
var router = new express.Router();

router.get('/debug.html', function (req, res, next) {
	res.render('notify', ejs.options(req, {message: 'notify'}));
});

module.exports = router;