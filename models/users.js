var db = require('./db');

exports.valid = false;

db.query(db.sql(function () { /* 
	create table if not exists users (
		id int not null auto_increment,
		name varchar(16) not null,
		password varchar(16) not null,
		email varchar(255) not null,
		valid boolean default false,
		cts timestamp not null,
		uts timestamp default current_timestamp on update current_timestamp,
		primary key (id),
		key (name),
		key (email)
	)
*/}), function(error) {
	if (error)
		throw new Error(error);

	exports.valid = true;

	selectUserById(1, function (user) {
		if (!user)
			insertUser('root', '123456', 'lambdax_xx@126.com', function () {
				updateUserValid(1, true, function () { })
			})
	});
});

/* database */

function selectUserById(id, callback) {
	db.query(db.format("select * from users where id={1}", id), function (error, result, fields) {
		if (error)
			throw new Error(error);
		callback(result[0]);
	});
} 


function selectUserByName(name, callback) {
	db.query(db.format("select * from users where name='{1}'", db.dq(name)), function (error, result, fields) {
		if (error)
			throw new Error(error);
		callback(result[0]);
	});
} 

function selectUserByEmail(email, callback) {
	db.query(db.format("select * from users where email='{1}'", db.dq(email)), function (error, result, fields) {
		if (error)
			throw new Error(error);
		callback(result[0]);
	});
}

function insertUser(name, password, email, callback) {
	db.query(db.format("insert into users (name, password, email, cts) values ('{1}', '{2}', '{3}', now())", 
		db.dq(name), db.dq(password), db.dq(email)), 
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback();
	});
}

function updateUserPassowrd(id, password, callback) {
	db.query(db.format("update users set password='{1}' where id={2}", password, id),
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback();
	});
}

function updateUserValid(id, valid, callback) {
	db.query(db.format("update users set valid={1} where id={2}", valid, id),
		function (error, result, fields) {
			if (error)
				throw new Error(error);
			callback();
	});
}

function validate(field, value) {
	switch (field) {
		case 'name':
			if (!value)
				return '没有用户名字';
			if (value.length < 2 || value.length > 16)
				return '用户名长度必须大于2个字并且小于16个字';
			if (value.search(/[@]/g) != -1)
				return '用户名不能含有字符：@';
			break;
		case 'password':
			if (!value)
				return '没有密码';
			if (value.length < 6 || value.length > 16)
				return '密码长度必须大于6并且小于16';
			break;
		case 'email':
			break;
		default :
			return 'error';
	}
}

/* operation */

exports.login = function (key, password, callback) {
	var isEmail = key && (key.search('@') != -1);

	var error;

	if (error = validate(isEmail ? 'email' : 'name', key))
		return callback(error);

	if (error = validate('password', password))
		return callback(error);

	(isEmail ? selectUserByEmail : selectUserByName)(key, function (user) {
		if (!user)
			return callback('用户不存在');
		if (user.password != password)
			return callback('密码错误');

		user.isSuper = user.id == 1;

		callback(undefined, user);
	});
}

exports.registerCheck = function (variable, value, callback) {
	var error;
	if (error = validate(variable, value))
		return callback(error);

	if (variable == 'name') {
		selectUserByName(variable, function (user) {
			if (user)
				return callback('用户名字已经被注册');
			callback();
		});
	} else if (variable == 'email') {
		selectUserByEmail(variable, function (user) {
			if (user)
				return callback('邮箱已经被注册');
			callback();
		});
	} else {
		callback();
	}
}

exports.register = function (name, password, email, callback) {
	exports.registerCheck('name', name, function (error) {
		if (error)
			return callback(error);
		exports.registerCheck('password', password, function (error) {
			if (error)
				return callback(error);
			exports.registerCheck('email', email, function (error) {
				if (error)
					return callback(error);

				insertUser(name, password, email, callback);
			});
		});
	});
}

exports.modifyPassword = function (id, oldPassword, newPassword, callback) {
	var error;
	if (error = validate('password', oldPassword))
		return callback(error + '(原密码)');

	if (error = validate('password', newPassword))
		return callback(error + '(新密码)');

	selectUserById(id, function (user) {
		if (!user)
			return callback('用户不存在');

		if (user.password !== oldPassword)
			return callback('原密码错误');

		updateUserPassowrd(id, newPassword, callback);
	});
}

