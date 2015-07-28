var express = require('express');
var router = new express.Router();

var boards = require('../models/boards');

router.get('/admin.html', function (req, res, next) {
	if (!req.session.user)
		return res.ejs.render('notify', {message: '没有登录'});

	boards.zones(function (error, zones) {
		if (error) 
			return res.ejs.render('notify', {message: error});

		res.ejs.render('admin', { zones: zones });
	});
});

router.get('/admin/board.html', function (req, res, next) {
	if (!req.session.user)
		return res.ejs.render('notify', {message: '没有登录'});

	if (req.query.bid) {
		boards.board(req.query.bid, function (error, board) {
			if (error) 
				return res.ejs.render('notify', {message: error});

			res.ejs.render('board', { board: board });
		});
	} else {
		res.ejs.render('board', { belong: req.query.belong });
	}
});

router.post('/admin/do/board', function (req, res, next) {
	if (!req.session.user)
		return res.ejs.render('notify', {message: '没有登录'});

	var buffer = '';

	req.on('data', function (data) {
		buffer += data;
	});

	req.on('end', function () {
		var data = helpers.parseMultipart(buffer);

		if (data.bid) {
			boards.editBoard(req.session.user, data, function(error) {
				if (error)
					return res.ejs.render('notify', {message: error});
				else {
					ejs.dirtyPrefab('boardsTree');
					return res.ejs.render('notify', {message: '新板块已经被添加', jump: -2, refresh: true});
				}
			});
		} else {
			boards.addBoard(req.session.user, data, function(error) {
				if (error)
					return res.ejs.render('notify', {message: error});
				else {
					ejs.dirtyPrefab('boardsTree');
					return res.ejs.render('notify', {message: '新板块已经被添加', jump: -2, refresh: true});
				}
			});
		}
	})
});

module.exports = router;

ejs.websitePath(['/admin.html', '/admin/do/board', '/admin/board.html'], [{ name: "管理", url: '/admin.html' }]);