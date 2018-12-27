'use strict';

const TAG     = '[FormController]';
const crypto  = require('crypto');
const moment = require('moment');
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

  let query = `SELECT * FROM forms WHERE employee_id = ?`;
	let viewForms = TimeHackMySQL.execute(query, [this.req.body.employeeId]);
	viewForms.then((forms)=>{
		if(forms.length > 0) {
			return cb(null, {
				forms: forms
			});
		} else {
			return cb(null, {
	      message: "No forms filed yet"
			});
		}
	}).catch((error)=>{
		Logger.log('error', TAG + ACTION, error);
    console.log(error);
		return cb(Errors.raise('INTERNAL_SERVER_ERROR', error));
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
