'use strict';

const TAG     = '[LoginController]';
const crypto  = require('crypto');
const uuidv4 	= require('uuid/v4');
const Logger  = require('../../services/Logger');
const Errors  = require('../../services/Errors');
const TimeHackMySQL = require('../../services/TimeHackMySQL');

function LoginController(req, res) {
	this.req = req;
	this.res = res;
};

LoginController.prototype.submitLogin = function(cb, result) {
	let ACTION = '[submitLogin]';

	let encryptedPassword = crypto.createHmac('sha256', process.env.HMAC_KEY).update(this.req.body.password).digest('hex');

	let query = `SELECT firstName, lastName, emailAddress, position FROM employee WHERE emailAddress = "` + this.req.body.email + `" AND password="` + encryptedPassword + `" AND user_role LIKE"%` + this.req.body.role + `%"`;
	let getEmployee = TimeHackMySQL.execute(query);
	getEmployee.then((employees)=>{
		if(employees.length > 0) {
			let employee = employees[0];
			employee.role = this.req.body.role;

			return cb(null, {
        message: "Successfully validated.",
				employee: employee
			});
		} else {
			return cb(Errors.raise('UNAUTHORIZED_ACCESS'));
		}
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
		console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
	});
};

module.exports = LoginController;
