var express = require('express');
var router = new express.Router();

router.get('/user.html', function (req, res, next) {
	res.render('user', ejs.options(req, { admin: true }));
});

module.exports = router;