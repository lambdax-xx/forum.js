var express = require('express');
var router = new express.Router();


var boards = require('../models/boards');
var topics = require('../models/topics');

router.get('/forum.html', function (req, res, next) {
	if (!req.query.bid)
		return res.render('notify', ejs.options(req, {message: '没有版块ID'}));

	boards.board(req.query.bid, function (error, board) {
		if (error) 
			return res.render('notify', ejs.options(req, {message: error}));

		if (!board)
			return res.render('notify', ejs.options(req, {message: "版块未找到"}));

		var order;

		if (req.query.orderBy == 'created') {
			if (req.query.asc)
				order = 'cts';
			else
				order = 'cts desc';
		}

		topics.pageTopics(req.query.bid, req.query.page || 0, {
				filter: req.query.filter,
				order: order,
			}, function (error, topics) {
				if (error)
					return res.render('notify', ejs.options(req, {message: error}));

				board.topics = topics;

				res.render('forum', ejs.options(req, { board: board }));
			});
	});
});

router.get('/topic.html', function (req, res, next) {
	if (req.query.tid) {
		topics.topic(req.query.tid, function (error, topic) {
			if (error) 
				return res.render('notify', ejs.options(req, {message: error}));

			if (!topic)
				return res.render('notify', ejs.options(req, {message: '主题未找到'}));

			res.render('topic', ejs.options(req, {topic: topic}));
		});
	} else {
		if (!req.query.bid)
			return res.render('notify', ejs.options(req, {message: '没有板块ID'}));

		boards.board(req.query.bid, function (error, board) {
			if (error) 
				return res.render('notify', ejs.options(req, {message: error}));

			if (!board)
				return res.render('notify', ejs.options(req, {message: "版块未找到"}));

			res.render('topic', ejs.options(req, {bid: req.query.bid}));
		});
	}
});

router.post('/do/topic', function(req, res, next) {
	var buffer = '';

	req.on('data', function (data) {
		buffer += data;
	});

	req.on('end', function () {
		if (!req.session.user)
			return res.render('notify', ejs.options(req, {message: '没有登录'}));

		var data = helpers.parseMultipart(buffer);

		if (!data.tid &&  !data.bid)
			return res.render('notify', ejs.options(req, {message: '没有版块ID'}));

		if (data.tid) {
			exports.topic(data.tid, function (error, topic) {
				if (error)
					return res.render('notify', ejs.options(req, {message: error}));

				if (!topic)
					return res.render('notify', ejs.options(req, {message: '没有找到主题'}));

				if (!req.session.user.isUpser && user.id != topic.author)
					return res.render('notify', ejs.options(req, {message: '只有主题作者才能编辑'}));

				topics.editTopic(date.tid, data.headline, data.category, data.caption, data.content, data.type, function(error){
					if (!error)
						return res.render('notify', ejs.options(req, {message: error}));
					res.render('notify', ejs.options(req, {message: '主题编辑完成', jump: -2, refresh: true}));
				});
			});
		} else {
			boards.internals.selectBoardById(data.bid, function (board){
				if (!board)
					return res.render('notify', ejs.options(req, {message: '版块没有找到'}));

				topics.addTopic(data.bid, data.headline, req.session.user.id, data.category, data.caption, data.content, data.type, function(error) {
					if (error)
						return res.render('notify', ejs.options(req, {message: error}));
					res.render('notify', ejs.options(req, {message: '新主题保存完成', jump: -2, refresh: true}));
				});
			});
		}
	});
});

var users = require('../models/users');

router.get('/thread.html', function (req, res, next) {
	if (!req.query.tid)
		return res.render('notify', ejs.options(req, {message: '没有主题ID'}));

	topics.topic(req.query.tid, function (error, topic) {
		if (error) 
			return res.render('notify', ejs.options(req, {message: error}));

		if (!topic)
			return res.render('notify', ejs.options(req, {message: '主题未找到'}));

		var author;

		if (req.query.author) {
			users.internals.selectUserByName(req.query.author, function (user) {
				if (user)
					author = user.id;
				next();
			});
		} else {
			var next = function () {
				topics.pageThread(req.query.tid, req.query.page || 0, {
					author: req.query.author,
					order: order,
				}, function (error, topics) {
					if (error)
						return res.render('notify', ejs.options(req, {message: error}));

					board.topics = topics;

					res.render('forum', ejs.options(req, { board: board }));
				});
			}
			next();
		}
	});
});

module.exports = router;