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

EmployeeController.prototype.getApprover = function(cb, result) {
  let ACTION = '[getApprover]';

	let query = `SELECT e.* FROM employee_approver ea JOIN employee e ON ea.approverId = e.id WHERE employeeId = ?`;
	let getApprover = TimeHackMySQL.execute(query, [this.req.params.employee_id]);
	getApprover.then((approvers)=>{
		if(approvers.length != 0) {
			let approver = approvers[0];
      return cb(null, {
        message: "Approver details succesfully fetched.",
        employee: {
          id: approver.id,
          name: {
            first: approver.firstName,
            middle: approver.middleName,
            last: approver.lastName
          }
        }
      });
    } else {
      return cb(null, {
        message: "No approver for this employee yet."
      });
    }
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
		console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
	});
};

EmployeeController.prototype.checkApproverId = function(cb, result) {
  let ACTION = '[checkApproverId]';

  let query = `SELECT * FROM employee WHERE id = ?`;
  let checkEmployee = TimeHackMySQL.execute(query, [this.req.body.approverId]);
  checkEmployee.then((check)=>{
    if(!result.getApprover.employee) {
      if(this.req.body.approverId != this.req.params.employee_id) {
        if(check.length != 0) {
          return cb(null, check);
        } else {
          let error = Errors.raise('NOT_FOUND');
          delete error.error.params;
          error.error.message = 'Approver ID not found.';
          return cb(error);
        }
      } else {
        let error = Errors.raise('MISSING_INVALID_PARAMS');
        delete error.error.params;
        error.error.message = 'Employee ID cannot be the same with Approver ID.';
        return cb(error);
      }
    } else {
      let error = Errors.raise('MISSING_INVALID_PARAMS');
      delete error.error.params;
      error.error.message = 'Employee has approver assigned to it already.';
      return cb(error);
    }
  }).catch((error)=>{
    Logger.log('error', TAG + ACTION, error);
    console.log(error);
    return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
  });
};

EmployeeController.prototype.addApprover = function(cb, result) {
  let ACTION = '[addApprover]';

  let data = {
    employeeId: this.req.params.employee_id,
    approverId: this.req.body.approverId
  };

	let query = `INSERT INTO employee_approver SET ?`;
	let addApprover = TimeHackMySQL.execute(query, [data]);
	addApprover.then((approver)=>{
		return cb(null, {
      message: 'Successfully added employee approver.'
		});
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
		console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
	});
};

module.exports = EmployeeController;
