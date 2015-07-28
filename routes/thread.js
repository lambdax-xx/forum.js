var express = require('express');

var router = new express.Router();

var topics = require('../models/topics');

var users = require('../models/users');

router.get('/thread.html', function (req, res, next) {
	if (!req.query.tid)
		return res.ejs.render('notify', {message: '没有主题ID'});

	topics.topic(req.query.tid, function (error, topic) {
		if (error) 
			return res.ejs.render('notify', {message: error});

		if (!topic)
			return res.ejs.render('notify', {message: '主题未找到'});

		var author;

		var next = function () {
			topics.pageThreads(req.query.tid, req.query.page || 0, {author: author}, function (error, threads) {
				if (error)
					return res.ejs.render('notify', {message: error});

				topic.threads = threads;

				req.slot.topic = topic;

				res.ejs.render('thread', {topic : topic});
				});
		}

		if (req.query.author) {
			users.internals.selectUserByName(req.query.author, function (user) {
				if (user)
					author = user.id;
				next();
			});
		} else {
			next();
		}
	});
});

router.get('/reply.html', function (req, res, next) {
	if (!req.session.user)
		return res.ejs.render('notify', {message: '没有登录'});

	if (req.query.thid) {
		topics.internals.selectThreadById(req.query.thid, function (thread) {
			if (!thread)
				return res.ejs.render('notify', {message: '帖子未找到'});

			if (!req.session.user.isUpser && req.session.user.id != thread.author)
				return res.ejs.render('notify', {message: '只有作者才能编辑主题'});

			topics.internals.selectTopicById(thread.topic, function (topic) {
				if (!topic)
					return res.ejs.render('notify', {message: '主题未找到'});

				req.slot.topic = topic;
				req.slot.thread = thread;

				res.ejs.render('reply', {topic : topic, thread: thread});
			});
		});
	} else {
		if (!req.query.tid)
			return res.ejs.render('notify', {message: '没有主题ID'});

		topics.internals.selectTopicById(req.query.tid, function (topic) {
			if (!topic)
				return res.ejs.render('notify', {message: '主题未找到'});

			req.slot.topic = topic;

			res.ejs.render('reply', {topic : topic});
		});
	}
});

router.post('/do/reply', function (req, res, next) {
	if (!req.session.user)
			return res.ejs.render('notify', {message: '没有登录'});

	var buffer = '';

	req.on('data', function (data) {
		buffer += data;
	});

	req.on('end', function () {
		var data = helpers.parseMultipart(buffer);

		if (!data.thid &&  !data.tid)
			return res.ejs.render('notify', {message: '没有主题ID'});

		if (data.thid) {
			topics.internals.selectThreadById(data.thid, function (thread) {
				if (!thread)
					return res.ejs.render('notify', {message: '没有找到回复'});

				if (!req.session.user.isUpser && req.session.user.id != thread.author)
					return res.ejs.render('notify', {message: '只有回复作者才能编辑'});

				topics.editThread(data.thid, data.type, data.caption, data.content, function (error){
					if (error)
						return res.ejs.render('notify', {message: error});

					res.ejs.render('notify', {message: '回复编辑完成', jump: -2, refresh: true});
				});
			});
		} else {
			topics.internals.selectTopicById(data.tid, function (topic){
				if (!topic)
					return res.ejs.render('notify', {message: '主题没有找到'});

				topics.addThread(topic, req.session.user.id, data.type, data.caption, data.content, function (error) {
					if (error)
						return res.ejs.render('notify', {message: error});

					res.ejs.render('notify', {message: '回复保存完成', jump: -2, refresh: true});
				});
			});
		}
	});
});

module.exports = router;

ejs.websitePath('/thread.html', function (req) {
	return ejs.findBoardPathById(req.slot.topic.board).concat([{name: req.slot.topic.headline, url: req.url}]);
});

ejs.websitePath('/reply.html', function (req) {
	if (req.slot.thread) {
		return ejs.findBoardPathById(req.slot.topic.board).concat([
				{name: req.slot.topic.headline, url: '/thread.html?tid=' + req.slot.topic.id}, 
				{name: req.slot.thread.caption, url: req.url}
			]);
	}
	
	return ejs.findBoardPathById(req.slot.topic.board).concat([
			{name: req.slot.topic.headline, url: '/thread.html?tid=' + req.slot.topic.id}, 
			{name: '新回复', url: req.url}
		]);
});
