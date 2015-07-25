var express = require('express');
var router = new express.Router();

var boards = require('../models/boards');

router.get('/admin.html', function (req, res, next) {
	if (!req.session.user)
		return res.render('notify', ejs.options(req, {message: '没有登录'}));

	boards.zones(function (error, zones) {
		if (error) 
			return res.render('notify', ejs.options(req, {message: error}));

		res.render('admin', ejs.options(req, { zones: zones }));
	});
});

router.get('/admin/board.html', function (req, res, next) {
	if (!req.session.user)
		return res.render('notify', ejs.options(req, {message: '没有登录'}));

	if (req.query.bid) {
		boards.board(req.query.bid, function (error, board) {
			if (error) 
				return res.render('notify', ejs.options(req, {message: error}));

			res.render('board', ejs.options(req, { board: board }));
		});
	} else {
		res.render('board', ejs.options(req, { belong: req.query.belong }));
	}
});

router.post('/admin/do/board', function (req, res, next) {
	if (!req.session.user)
		return res.render('notify', ejs.options(req, {message: '没有登录'}));

	var buffer = '';

	req.on('data', function (data) {
		buffer += data;
	});

	req.on('end', function () {
		var data = helpers.parseMultipart(buffer);

		if (data.bid) {
			boards.editBoard(req.session.user, data, function(error) {
				if (error)
					return res.render('notify', ejs.options(req, {message: error}));
				else
					return res.render('notify', ejs.options(req, {message: '新板块已经被添加', jump: -2, refresh: true}));

			})
		} else {
			boards.addBoard(req.session.user, data, function(error) {
				if (error)
					return res.render('notify', ejs.options(req, {message: error}));
				else
					return res.render('notify', ejs.options(req, {message: '新板块已经被添加', jump: -2, refresh: true}));

			})
		}
	})
});


module.exports = router;