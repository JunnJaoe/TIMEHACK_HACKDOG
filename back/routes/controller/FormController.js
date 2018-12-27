'use strict';

const TAG     = '[FormController]';
const crypto  = require('crypto');
const moment 	= require('moment');
const async   = require('async');
const uuidv4 	= require('uuid/v4');
const Logger  = require('../../services/Logger');
const Errors  = require('../../services/Errors');
const TimeHackMySQL = require('../../services/TimeHackMySQL');

function FormController(req, res) {
	this.req = req;
	this.res = res;
};

FormController.prototype.viewForms = function(cb, result) {
	let ACTION = '[viewForms]';

	let employeeId = this.req.body.employeeId;

	async.auto({
		getApproved: function(callback) {
			let query = `SELECT form_type, start_date, end_date, total_days, credit, details, date_approved, date_filed FROM forms WHERE employee_id = ? AND status=1 AND is_cancelled=0`;
			let getApproved = TimeHackMySQL.execute(query, employeeId);
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
      let query = `SELECT form_type, start_date, end_date, total_days, credit, details, date_approved, reason_for_cancel, date_cancelled, date_filed FROM forms WHERE employee_id = ? AND status=1 AND is_cancelled!=0`;
			let getCancelled = TimeHackMySQL.execute(query, employeeId);
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
      let query = `SELECT form_type, start_date, end_date, total_days, credit, details, date_filed FROM forms WHERE employee_id = ? AND status=0 AND is_deleted=0`;
			let getPending = TimeHackMySQL.execute(query, employeeId);
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
      let query = `SELECT form_type, start_date, end_date, total_days, credit, details, date_filed FROM forms WHERE employee_id = ? AND status=-1 AND is_deleted=0`;
			let getDisapproved = TimeHackMySQL.execute(query, employeeId);
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

FormController.prototype.addForm = function(cb, result) {
	let ACTION = '[addForm]';

  let body = this.req.body;

  let data = {
    id: uuidv4(),
    employee_id: body.employeeId,
    form_type: body.formType,
    start_date: body.startDate,
    end_date: body.endDate,
    total_days: body.totalDays,
    details: body.details,
    date_filed: new Date()
  };

  let query = `INSERT INTO forms SET ?`;
	let addForm = TimeHackMySQL.execute(query, data);
	addForm.then((form)=>{
    return cb(null, {
      message: 'Successfully added form.',
      data: data
		});
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
    console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
  });
};

FormController.prototype.deleteForm = function(cb, result) {
	let ACTION = '[deleteForm]';

	let date = '"' + moment().format('YYYY-MM-DD HH:MM:SS')  + '"';

	let data = {
		is_deleted: 1,
		date_deleted: date
	};

  let query = `UPDATE forms SET ? WHERE id="` + this.req.body.formId + `" AND employee_id="` + this.req.body.employeeId + `" AND is_deleted=0`;
	let deleteForm = TimeHackMySQL.execute(query, data);
	deleteForm.then((form)=>{
		if(form.changedRows > 0) {
			return cb(null, {
				message: "Successfully deleted form."
			});
		} else {
			return cb(null, {
				message: "Form already deleted/does not exist."
			});
		}
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
    console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
  });
};

FormController.prototype.cancelForm = function(cb, result) {
	let ACTION = '[cancelForm]';

	let date = '"' + moment().format('YYYY-MM-DD HH:MM:SS')  + '"';

	let data = {
		is_cancelled: 1,
		date_cancelled: date,
		reason_for_cancel: this.req.body.reason
	};

  let query = `UPDATE forms SET ? WHERE id="` + this.req.body.formId + `" AND employee_id="` + this.req.body.employeeId + `" AND is_cancelled=0`;
	let cancelForm = TimeHackMySQL.execute(query, data);
	cancelForm.then((form)=>{
		if(form.changedRows > 0) {
			return cb(null, {
				message: "Successfully cancelled form."
			});
		} else {
			return cb(null, {
				message: "Form already cancelled/does not exist."
			});
		}
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
    console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
  });
};

FormController.prototype.approveForm = function(cb, result) {
	let ACTION = '[approveForm]';

	let date = '"' + moment().format('YYYY-MM-DD HH:MM:SS')  + '"';

	let data = {
		status: 1,
		date_approved: date
	};

  let query = `UPDATE forms SET ? WHERE id="` + this.req.body.formId + `" AND status!=0`;
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

module.exports = FormController;
