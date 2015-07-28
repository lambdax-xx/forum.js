
var websitePaths = {};

// default options for render ejs.
global.ejs = {
	options: function (req, others) {
		return helpers.assign({
			session: req.session,

			title: config.title || config.appName, 
			caption: config.caption || config.title || config.appName, 

		}, others);
	},
	locals: {},
	render: function (req, res, views, opts) {
		ejs.prefab (function () {
			var navigator = websitePaths[req.route.path];
			if (typeof navigator === 'function')
				navigator = navigator(req);
			opts.websitePath = navigator;
			res.render(views, ejs.options(req, opts));
		});
	},
	websitePath: function(path, navigator) {
		if (Array.isArray(path)) {
			for (var i = 0; i < path.length; i++)
				websitePaths[path[i]] = navigator;
		} else  {
			websitePaths[path] = navigator;	
		}
	},
}

app.locals.ejs = ejs.locals;

var boards = require('./models/boards')

ejs.dirtyPrefab = function (property) {
	delete ejs.locals[property];
}

ejs.prefab = function (next) {
	if (!ejs.locals.boardsTree) {
		boards.boardsTree(function (tree) {
			ejs.locals.boardsTree = tree;
			next();
		});
	} else {
		next();
	}
}

function fbp(boards, bid) {
	if (boards)  {
		for (var i = 0; i < boards.length; i++) {
			var board = boards[i];

			if (board.id == bid)
				return [{ name: board.title, url: '/forum.html?bid=' + board.id }];

			var sub = fbp(boards[i].boards, bid);

			if (sub)
				return [{ name: board.title, url: '/forum.html?bid=' + board.id }].concat(sub);
		}
	}
}

ejs.findBoardPathById = function (bid) {
	if (!bid)
		return [];

	var path = fbp(ejs.locals.boardsTree, bid);
	return path || [];
}
