var express = require('express');
var favicon = require('serve-favicon');
var session = require('express-session');
var fs = require('fs');

var app = express();
global.app = app;

var cfg = fs.readFileSync('./config.json', 'utf-8');
global.config = JSON.parse(cfg);

if (!config.port)
	config.port = process.env.PORT || 3000;

console.log('config:');
console.log(config);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon(__dirname + "/favicon.png"));
app.use(session({
	secret: 'lambda x.xx',
	name: 'FORMSID',
	resave: false,
	saveUninitialized: false,
	cookie: { 
		expires: new Date(2030, 1, 1)
	}
}));
app.use(express.static(__dirname + '/public'));

require('./helpers.js');
require('./ejs.js')

var router = require('./router');

app.use(router);

app.listen(config.port, function (error) {
	if (error)
		console.log(error);
	else
		console.log(config.appName + ' server listening on port ' + config.port + '.');
});
