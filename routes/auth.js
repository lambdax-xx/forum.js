var express = require('express');
var router = new express.Router();

var users = require('../models/users');

router.get('/auth.htm', function (req, res, next) {
	res.ejs.render('@auth');
})

router.get('/auth/login', function (req, res, next) {
	if (req.session.user)
		return res.end('已经登录了');

	users.login(req.query.key, req.query.password, function (error, user) {
		if (error)
			return res.end(error);

		req.session.user = user;

		res.end('ok');
	});
});

router.get('/auth/logout', function (req, res, next) {
	if (!req.session.user)
		return res.end('没有登录');

	delete req.session.user;

	res.end('ok');
});

router.get('/auth/register', function (req, res, next) {
	if (!req.session.captcha || req.session.captcha.code != req.query.captcha)
		return res.end('验证码不正确');

	users.register(req.query.name, req.query.password, req.query.email, function (error) {
		res.end(error || 'ok');
	});
});

router.get('/auth/registerCheck', function (req, res, next) {
	if (req.query.variable == 'captcha') {
		if (req.session.captcha && req.session.captcha.code == req.query.value) {
			res.end('ok');
		} else {
			res.end('验证码不正确');
		}
	}

	users.registerCheck(req.query.variable, req.query.value, function (error) {
		res.end(error || 'ok');
	})
})

router.get('/auth/modifyPassword', function (req, res, next) {
	if (!req.session.user)
		return res.end('没有登录');

	users.modifyPassword(req.session.user.id, req.query.oldPassword, req.query.newPassword, function (error) {
		 res.end(error || 'ok');
	});
})

var captcha = require('../captcha');

router.get('/auth/captcha.img', function (req, res, next) {
	if (!req.session.captcha || req.query.doChange)
		req.session.captcha = captcha.get();

	res.end(req.session.captcha.image);
})

module.exports = router;
