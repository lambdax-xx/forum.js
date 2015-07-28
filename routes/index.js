var express = require('express');
var router = new express.Router();


var boards = require('../models/boards');

router.get(['/', '/index.html'], function (req, res, next) {

	boards.zones(function (error, zones) {
		if (error) 
			return res.ejs.render('notify', {message: error});

		res.ejs.render('index', { zones: zones });
	});
});

module.exports = router;