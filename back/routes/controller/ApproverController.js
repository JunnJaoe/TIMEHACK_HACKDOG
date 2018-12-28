'use strict';

const TAG     = '[ApproverController]';
const crypto  = require('crypto');
const moment 	= require('moment');
const async   = require('async');
const uuidv4 	= require('uuid/v4');
const Logger  = require('../../services/Logger');
const Errors  = require('../../services/Errors');
const TimeHackMySQL = require('../../services/TimeHackMySQL');

function ApproverController(req, res) {
	this.req = req;
	this.res = res;
};

ApproverController.prototype.viewForms = function(cb, result) {
	let ACTION = '[viewForms]';

	let approverId = this.req.body.approverId;

	async.auto({
		getApproved: function(callback) {
			let query = `SELECT CONCAT(e.lastName, ", ", e.firstName) as employee, form_type, start_date, end_date, total_days, credit, details, date_approved, date_filed FROM forms f JOIN employee_approver ea ON f.employee_id = ea.employeeId AND approverId = ? JOIN employee e ON f.employee_id = e.id WHERE status=1 AND is_cancelled=0`;
			let getApproved = TimeHackMySQL.execute(query, approverId);
			getApproved.then((forms)=>{
				if(forms.length > 0) {
					callback(null, forms);
				} else {
					callback(null, {
			      message: "No approved forms yet."
					});
				}
			}).catch((error)=>{
				Logger.log('error', TAG + ACTION, error);
		    console.log(error);
				return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
		  });
    },
    getCancelled: ['getApproved', function(res, callback) {
      let query = `SELECT CONCAT(e.lastName, ", ", e.firstName) as employee, form_type, start_date, end_date, total_days, credit, details, date_approved, reason_for_cancel, date_cancelled, date_filed FROM forms f JOIN employee_approver ea ON f.employee_id = ea.employeeId AND approverId = ? JOIN employee e ON f.employee_id = e.id WHERE status=1 AND is_cancelled!=0`;
			let getCancelled = TimeHackMySQL.execute(query, approverId);
			getCancelled.then((forms)=>{
				if(forms.length > 0) {
					callback(null, forms);
				} else {
					callback(null, {
			      message: "No cancelled forms yet."
					});
				}
			}).catch((error)=>{
				Logger.log('error', TAG + ACTION, error);
		    console.log(error);
				return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
		  });
    }],
		getPending: ['getCancelled', function(res, callback) {
      let query = `SELECT CONCAT(e.lastName, ", ", e.firstName) as employee, form_type, start_date, end_date, total_days, credit, details, date_filed FROM forms f JOIN employee_approver ea ON f.employee_id = ea.employeeId AND approverId = ? JOIN employee e ON f.employee_id = e.id WHERE status=0 AND is_deleted=0`;
			let getPending = TimeHackMySQL.execute(query, approverId);
			getPending.then((forms)=>{
				if(forms.length > 0) {
					callback(null, forms);
				} else {
					callback(null, {
			      message: "No pending forms yet."
					});
				}
			}).catch((error)=>{
				Logger.log('error', TAG + ACTION, error);
		    console.log(error);
				return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
		  });
    }],
		getDisapproved: ['getPending', function(res, callback) {
      let query = `SELECT CONCAT(e.lastName, ", ", e.firstName) as employee, form_type, start_date, end_date, total_days, credit, details, date_filed FROM forms f JOIN employee_approver ea ON f.employee_id = ea.employeeId AND approverId = ? JOIN employee e ON f.employee_id = e.id WHERE status=-1 AND is_deleted=0`;
			let getDisapproved = TimeHackMySQL.execute(query, approverId);
			getDisapproved.then((forms)=>{
				if(forms.length > 0) {
					callback(null, forms);
				} else {
					callback(null, {
			      message: "No disapproved forms yet."
					});
				}
			}).catch((error)=>{
				Logger.log('error', TAG + ACTION, error);
		    console.log(error);
				return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
		  });
    }]
	}, function(err, results) {
		cb(null, results);
	});
};

ApproverController.prototype.approveForm = function(cb, result) {
	let ACTION = '[approveForm]';

	let date = '"' + moment().format('YYYY-MM-DD HH:MM:SS')  + '"';

	let data = {
		status: 1,
		date_approved: date
	};

  let query = `UPDATE forms SET ? WHERE id="` + this.req.body.formId + `" AND status=0`;
	let approveForm = TimeHackMySQL.execute(query, data);
	approveForm.then((form)=>{
		if(form.changedRows > 0) {
			return cb(null, {
				message: "Successfully approved form."
			});
		} else {
			return cb(null, {
				message: "Form already approved/does not exist."
			});
		}
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
    console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
  });
};

module.exports = ApproverController;
