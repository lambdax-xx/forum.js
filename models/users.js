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
		key (name)
	)
*/}), function(error) {
	if (!error)
		exports.valid = true;
});

