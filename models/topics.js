var db = require('./db');

exports.invalid = -2;

db.query(db.sql(function () {/*
	create table if not exists topics (
		id bigint not null auto_increment,
		board int not null,
		headline varchar(255) not null,
		author int not null,
		threads int default 0,
		visits int default 0,
		cts datetime not null,
		uts timestamp default current_timestamp on update current_timestamp,
		uuid int not null,
		category varchar(32), 

		primary key (id)
	)
*/}), function (error) {
	if (error)
		throw new Error(error);

	exports.invalid++;
});

db.query(db.sql(function () {/*
	create table if not exists threads (
		id bigint not null auto_increment,
		topic int not null,
		index int not null,
		caption varchar(255) not null,
		content text,
		author int not null,
		type tinyint defaylt 0,
		cts datetime not null,
		uts timestamp default current_timestamp on update current_timestamp,

		primary key (id)
	)
*/}), function (error) {
	if (error)
		throw new Error(error);

	exports.invalid++;
});

/* database */


function countTopicsOfBoard(bid, callback) {
	db.query(db.format('select count(id) from topics where topics.board = {1}', bid),
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result['count(id)']);
		});
}

var users = require('./users');

function selectTopicsOfBoard(bid, start, length, filter, order, callback) {
	if (filter === 'function') {
		callback = filter;
		filter = undefined;
	} else if (order === 'function') {
		callback = order;
		order = undefined;
	}

	if (!order)
		order = 'uts desc';

	var sqlfilter = "";

	if (filter) 
		sqlfiler = " and topics.category = '" + filter + "' ";

	db.query(db.format(db.sql(function () { /* 
		select * from topics, users 
			where topics.board = {1} {2} and 
				  topics.author = users.id
			order by {3} 
			limit {4}, {5}
	*/}), bid, sqlfilter, order, start, length),
		function (error, result, fields) {
			if (error)
				throw new Error(error);

			var n = 0;
			var loop = function () {
				if (n++ < results.length) {
					users.internals.selectUserById(results[n].uuid, function (user) {
						result[n].lastThreadAuthor = user;
						loop();
					});
				} else {
					callback(result);
				}
			};

			loop();
		});
}

function countThreadsOfTopic(tid, callback) {
	db.query(db.format('select count(id) from threads where threads.topic = {1}', tid),
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result['count(id)']);
		});
}

function selectThreadsOfTopic(tid, start, length, author, callback) {
	if (author === 'function') {
		callback = author;
		author = undefined;
	}

	var sqlfilter = "";

	if (author)
		sqlfilter = " and topics.author = " + author + " ";

	db.query(db.format(db.sql(function () { /* 
		select * from threads, users 
			where threads.topic = {1} {2} and
				  topics.author = users.id
			order by index 
			limit {3}, {4}
	*/}), tid, sqlfilter, start, length),
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result);
		});
}


/* operation */

exports.ThreadTypes = {
	Article: 0
}

exports.settings = {
	topicsPerPage: 32,
	threadsPerPage: 32,
}

exports.pageTopics = function (bid, page, options, callback) {
	countTopicsOfBoard(bid, function (total) {
		var pages = Math.trunc(total / exports.settings.topicsPerPage) + 
				((total % exports.settings.topicsPerPage) ? 1 : 0);

		if (page >= pages)
			page = pages - 1;

		if (page < 0)
			page = 0;

		if (!pages)
			return callback(undefined, {board: bid, page: page, pages: pages, total: total, options: options, topics: []});

		var order = undefined;

		if (options.orderByCreated) {
			order = 'cts';
		} else {
			order = 'uts';
		}

		if (options.desc) {
			order += ' decs';	
		}

		selectTopicsOfBoard(bid, page * exports.settings.topicsPerPage, exports.settings.topicsPerPage, 
			options.filter, order, function (topics) {
				callback(undefined, {topic: tid, page: page, pages: pages, total: total, options: options, topics: topics});
			});
	});
}

exports.pageThreads = function (tid, page, options, callback) {
	countThreadsOfTopic(tid, function (total) {
		var pages = Math.trunc(total / exports.settings.threadsPrePage) + 
				((total % exports.settings.threadsPrePage) ? 1 : 0);

		if (page >= pages)
			page = pages - 1;

		if (page < 0)
			page = 0;

		if (!pages)
			return callback(undefined, {board: bid, page: page, pages: pages, total: total,  options: options, threads: []});

		selectThreadsOfTopic(tid, page * exports.settings.threadsPrePage, exports.settings.threadsPrePage, 
			options.author,  function (threads) {
				callback(undefined, {topic: tid, page: page, pages: pages, options: options, total: total, threads: threads});
			});
	});
}

