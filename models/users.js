var db = require('./db');

exports.valid = false;

db.query(db.sql(function () { /* 
	create table if not exists users (
		id int not null auto_increment,
		name varchar(16) not null,
		password varchar(16) not null,
		email varchar(255) not null,
		cts timestamp not null,
		uts timestamp default current_timestamp no update current_timestamp,
		primary key (id),
		key (name),
		key (email)
	)
*/}), function(error) {
	if (!error)
		exports.valid = true;
});

exports.login = function (name, password, callback) {

	if (!name)
		return '没有用户名字'

	db.query(db.format("select * from users where name='{1}'", name), function (error, result, fields) {
		if (error)
			throw new Error(error);
		callback(result[0]);
	});
}

exports.register = function (name, password, email) {

}