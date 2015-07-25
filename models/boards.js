var db = require('./db');

exports.invalid = -2;

db.query(db.sql(function () {/* 
	create table if not exists boards (
		id int not null auto_increment,
		title varchar(32) not null,
		description varchar(255),
		author int not null,
		belong int default 0,
		type tinyint default 0,
		cts datetime not null,
		uts timestamp default current_timestamp on update current_timestamp,
		categories varchar(255),
		priority tinyint default 0,

		primary key(id)
	)
*/}), function (error) {
	if (error)
		throw new Error(error);

	exports.invalid++;
});

db.query(db.sql(function () {/*
	create table if not exists moderators (
		board int not null,
		user int not null
	)
*/}), function (error) {
	if (error)
		throw new Error(error);

	exports.invalid++;
});


/* database */

function selectModerators (bid, callback) {
	db.query(db.format("select * from moderators, users where moderators.board = {1} and moderators.user = users.id", bid), 
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result);
		});
}

function selectBoardById (bid, callback) {
	db.query(db.format("select boards.*, users.name as authorName from boards, users where boards.id = {1} and boards.author = users.id", bid), 
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result[0]);
		});	
}

function selectInnerBoards(bid, callback) {
	if (!bid)
		bid = 0;

	db.query(db.format("select boards.*, users.name as authorName from boards, users where boards.belong = {1} and boards.author = users.id", bid), 
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result);
		});
}

function insertIntoBoard (title, description, author, belong, type, categories, callback) {
	db.query(db.format("insert into boards (title, description, author, belong, type, categories, cts) " + 
						"values ('{1}', '{2}', {3}, {4}, {5}, '{6}', now())", 
		db.dq(title), db.dq(description), author, belong, type, db.dq(categories)), function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result);
		});	
}

function updateBoard (bid, title, description, type, categories, callback) {
	db.query(db.format("update boards set title='{1}', description='{2}', type={3}, categories='{4}' where id={5}", 
		db.dq(title), db.dq(description), type, db.dq(categories), bid), function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result);
		});	
}


/* operation */

exports.BoardTypes = {
	Zone: 0,
	Forum: 1,
}

exports.zones = function (callback) {
	selectInnerBoards(undefined, function (zones) {
		var n = 0;
		var loop = function () {
			if (n < zones.length) {
				selectInnerBoards(zones[n].id, function (boards) {
					zones[n].boards = boards;
					n++;
					loop();
				});
			} else {
				callback(undefined, zones);
			}
		};
		loop();
	});
}

exports.board = function (bid, callback) {
	selectBoardById(bid, function (board) {
		if (!board)
			return callback('版块不存在');

		selectInnerBoards(board.id, function (innerBoards) {
			board.boards = innerBoards;

			return callback(undefined, board);
		});
	});
}

exports.addBoard = function (user, data, callback) {
	var belong = data.belong;
	if (!belong)
		belong = 0;

	insertIntoBoard(data.title, data.description, user.id, belong, data.type, data.categories, function () {
		callback();
	});
}

exports.editBoard = function (user, data, callback) {
	selectBoardById(data.bid, function (board) {
		if (!board)
			return callback('版块不存在');

		if (!user.isSuper && board.author != user.id)
			return callback('只有作者才能编辑版块');

		updateBoard(data.bid, data.title, data.description, data.type, data.categories, function () {
			callback();
		});
	});
}
