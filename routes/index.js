var express = require('express');
var router = new express.Router();


var boards = require('../models/boards');

router.get(['/', '/index.html'], function (req, res, next) {

	boards.zones(function (error, zones) {
		if (error) 
			return res.render('notify', ejs.options(req, {message: error}));

		res.render('index', ejs.options(req, { zones: zones } ));
	});
});

module.exports = router;