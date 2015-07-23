var db = require('./db');

exports.valid = false;

db.query(db.sql(function () {/* 
	create table if not exists boards (
		
	)
*/}), function (error) {
	if (error)
		throw new Error(error);

	exports.valid = true;
});


/* database */

exports.selectSub = function () {

}