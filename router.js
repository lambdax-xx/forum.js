
app.use('*', function (req, res, next) {

	///* debug
	if (!req.session.user)
		req.session.user = {id: 1, name: "root"};
	//*/

	req.slot = {};

	res.ejs = {
		render: function (view, opts) {
			ejs.render(req, res, view, opts);
		}
	};

	next();
});

app.use(require('./routes/index'));
app.use(require('./routes/forum'));
app.use(require('./routes/thread'));
app.use(require('./routes/auth'));
app.use(require('./routes/admin'));
app.use(require('./routes/user'));
app.use(require('./routes/404'));
