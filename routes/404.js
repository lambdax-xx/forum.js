var express = require('express');
var router = new express.Router();

router.use('*', function(req, res, next){
	res.render('404', ejs.options(req));
});

module.exports = router;