
// default options for render ejs.
global.ejs = {
	options: function (req, others) {
		return helpers.assign({
			session: req.session,

			htmlTitle: config.htmlTitle || config.appName, 
			logoCaption: config.logoCaption || config.htmlTitle || config.appName, 

		}, others);
	}
}

app.locals.ejs = {

}