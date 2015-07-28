var express = require('express');
var router = new express.Router();

router.get('/user.html', function (req, res, next) {
	res.ejs.render('user', { admin: true });
});

module.exports = router;