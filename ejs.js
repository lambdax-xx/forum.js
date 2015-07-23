
// default options for render ejs.
global.ejs = {
	options: function (req, others) {
		return helpers.assign({
			session: req.session,

			title: config.title || config.appName, 
			caption: config.caption || config.title || config.appName, 

		}, others);
	}
}

app.locals.ejs = {

}