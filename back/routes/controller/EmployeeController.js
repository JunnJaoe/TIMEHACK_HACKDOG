'use strict';

const TAG     = '[EmployeeController]';
const crypto  = require('crypto');
const uuidv4 	= require('uuid/v4');
const Logger  = require('../../services/Logger');
const Errors  = require('../../services/Errors');
const TimeHackMySQL = require('../../services/TimeHackMySQL');

function EmployeeController(req, res) {
	this.req = req;
	this.res = res;
};

EmployeeController.prototype.employeeLogin = function(cb, result) {
	let ACTION = '[employeeLogin]';

	let query = `SELECT * FROM employee WHERE emailAddress = ?`;
	let getEmployee = TimeHackMySQL.execute(query, [this.req.body.username]);
	getEmployee.then((employees)=>{
		if(employees.length != 0) {
			let employee = employees[0];
			let encryptedPassword = crypto.createHmac('sha256', process.env.HMAC_KEY).update(this.req.body.password).digest('hex');
			if(encryptedPassword === employee.password) {
				employee.password = '[HIDDEN]';
				return cb(null, {
          message: "Successfully validated.",
					employee: employee
				});
			} else {
				return cb(Errors.raise('UNAUTHORIZED_ACCESS'));
			}
		} else {
			return cb(Errors.raise('UNAUTHORIZED_ACCESS'));
		}
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
		console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));  
	});
};

EmployeeController.prototype.addEmployee = function(cb, result) {
	let ACTION = '[addEmployee]';
  
  let body = this.req.body;
  let encryptedPassword = crypto.createHmac('sha256', process.env.HMAC_KEY).update(body.password).digest('hex');

  let data = {
    id: uuidv4(),
    firstName: body.name.first,
    middleName: body.name.middle,
    lastName: body.name.last,
    emailAddress: body.emailAddress,
    password: encryptedPassword,
    position: body.position,
    dateCreated: new Date()
  };

  let query = `INSERT INTO employee SET ?`;
	let addEmployee = TimeHackMySQL.execute(query, data);
	addEmployee.then((employee)=>{
    data.password = '[HIDDEN]';
		return cb(null, {
      message: 'Successfully added employee.',
      data: data
		});	
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
    console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));  
  });
};

module.exports = EmployeeController;