var express = require('express');
var router = new express.Router();

router.get(['/', '/index.html'], function (req, res, next) {
	res.render('index', ejs.options(req));
});

module.exports = router;