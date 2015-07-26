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
		serial int not null,
		caption varchar(255) not null,
		content text,
		author int not null,
		type tinyint default 0,
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
			callback(result[0]['count(id)']);
		});
}

var users = require('./users');

function selectTopicsOfBoard(bid, start, length, filter, order, callback) {
	if (!order)
		order = 'uts desc';

	var sqlfilter = "";

	if (filter) 
		sqlfiler = " and topics.category = '" + filter + "' ";

	db.query(db.format(db.sql(function () { /* 
		select topics.*, users.name as authorName from topics, users 
			where topics.board = {1} {2} and 
				  topics.author = users.id
			order by {3} 
			limit {4}, {5}
	*/}), bid, sqlfilter, order, start, length),
		function (error, result, fields) {
			if (error)
				throw new Error(error);

			callback(result);
		});
}

function countThreadsOfTopic(tid, callback) {
	db.query(db.format('select count(id) from threads where threads.topic = {1}', tid),
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result[0]['count(id)']);
		});
}

function selectThreadsOfTopic(tid, start, length, author, callback) {
	var sqlfilter = "";

	if (author)
		sqlfilter = " and topics.author = " + author + " ";

	db.query(db.format(db.sql(function () { /* 
		select threads.*, users.name as authorName from threads, users 
			where threads.topic = {1} {2} and
				  topics.author = users.id
			order by serial 
			limit {3}, {4}
	*/}), tid, sqlfilter, start, length),
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback(result);
		});
}

function insertIntoTopic(bid, headline, author, category, callback) {
	db.query(db.format("insert into topics (board, headline, author, cts, category) values ({1}, '{2}', {3}, now(), '{4}')",
			bid, db.dq(headline), author, db.dq(category)), function (error, result, fields) {
		if (error)
			throw new Error(error);

		db.query("select LAST_INSERT_ID()", function (error, result, fields) {
			if (error)
				throw new Error(error);

			callback(result[0]['LAST_INSERT_ID()']);	
		});
	});
}

function updateTopic(tid, headline, category, callback) {
	db.query(db.format("update topics set headline='{1}' category='{2}' where topics.id = {3}",
			db.dq(headline), db.dq(category), tid), function (error, result, fields) {
		if (error)
			throw new Error(error);

		callback();
	});
}

function updateTopicThreads(tid, threads, callback) {
	db.query(db.format("update topics set threads='{1}' where topics.id = {2}",
			threads, tid), function (error, result, fields) {
		if (error)
			throw new Error(error);

		callback();
	});
}

function updateTopicVisits(tid, visits, callback) {
	db.query(db.format("update topics set threads='{1}' where topics.id = {2}",
			threads, tid), function (error, result, fields) {
		if (error)
			throw new Error(error);

		callback();
	});
}

function insertIntoThread(tid, serial, author, caption, content, type, callback) {
	db.query(db.format("insert into threads (topic, serial, author, caption, content, type, cts) values ({1}, {2}, {3}, '{5}', '{5}', {6}, now())",
		tid, serial, author, db.dq(caption), db.dq(content), type), function (error, result, fields) {
			if (error)
				throw new Error(error);

			callback();
		});
}

function updateThread(thid, caption, content, type, callback) {
	db.query(db.format("update threads set caption = '{1}', content = '{2}', type = {3} where thread.id = {4}",
		db.dq(caption), db.dq(content), type, thid), function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback();
		});
}

function findMainThreadOfTopic(tid, callback) {
	db.query("select threads.*, users.name as authorName from threads, users where threads.topic = " + tid + 
		" and threads.serial = 0 and threads.author = users.id", function (error, result, fields) {
			if (error)
				throw new Error(error);

			callback(result[0]);
		});
}

function findLastThreadOfTopic(tid, callback) {
	db.query("select threads.*, users.name as authorName from threads, users where threads.topic = " + tid + 
		" and threads.author = users.id order by threads.serial desc limit 0, 1", function (error, result, fields) {
			if (error)
				throw new Error(error);

			callback(result[0]);
		});
}

function selectTopicById(tid, callback) {
	db.query("select topics.*, users.name as authorName from topics, users where topics.id = " + tid + 
		" and topics.author = users.id", function (error, result, fields) {
			if (error)
				throw new Error(error);

			callback(result[0]);
		});
}

/* operation */

exports.ThreadTypes = {
	Thread: 0,
	Article: 1,
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
				var n = 0;
				var loop = function () {
					if (n < topics.length) {
						findLastThreadOfTopic(topics[n].id, function (thread) {
							topics[n].lastReply = thread;
							n++;
							loop();
						})
					} else {
						helpers.assign(topics, {board: bid, page: page, pages: pages, total: total, options: options});
						callback(undefined, topics);
					}
				}

				loop();
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

exports.topic = function (tid, callback) {
	selectTopicById(tid, function (topic) { callback(undefined, topics);});
}

exports.addTopic = function (bid, headline, author, category, caption, content, type, callback) {
	insertIntoTopic(bid, headline, author, category, function (tid) {
		insertIntoThread(tid, 0, author, caption, content, type, callback);
	});
}

exports.editTopic = function (tid, headline, category, caption, content, type, callback) {
	updateTopic(tid, headline, category, function () {
		findMainThreadOfTopic(tid, function (mainThread) {
			updateThread(mainThread.id, caption , content, type, callback);
		});
	});
}
