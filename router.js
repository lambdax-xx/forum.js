var express = require('express');

var router = new express.Router();

router.get('/debug/notify.html', function (req, res, next) {
	res.render('notify', ejs.options(req, {message: 'notify'}));
});

router.use('*', function(req, res, next){
	res.render('404', ejs.options(req));
});

module.exports = router;