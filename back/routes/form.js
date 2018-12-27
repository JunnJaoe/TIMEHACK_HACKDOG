const TAG        = '[forms]';
const express    = require('express');
const async      = require('async');
const Logger     = require('../services/Logger');
const router     = express.Router();

const FormController = require('./controller/FormController');

// router.post('/login', function(req, res, next) {
// 	var ACTION = '[login]';
// 	Logger.log('debug', TAG + ACTION + ' request body', req.body);
//
// 	var _employee = new EmployeeController(req);
// 	async.auto({
// 		employeeLogin:		_employee.employeeLogin.bind(_employee),
// 	}, function(err, result) {
// 		if (err) return res.error(err);
// 		else return res.ok(result.employeeLogin);
// 	});
// });

router.get('/', function(req, res, next) {
	var ACTION = '[view]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _form = new FormController(req);
	async.auto({
		viewForms:		_form.viewForms.bind(_form),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.viewForms);
	});
});

router.post('/add', function(req, res, next) {
	var ACTION = '[add]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _form = new FormController(req);
	async.auto({
		addForm:		_form.addForm.bind(_form),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.addForm);
	});
});

router.post('/delete', function(req, res, next) {
	var ACTION = '[delete]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _form = new FormController(req);
	async.auto({
		deleteForm:		_form.deleteForm.bind(_form),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.deleteForm);
	});
});

router.post('/cancel', function(req, res, next) {
	var ACTION = '[cancel]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _form = new FormController(req);
	async.auto({
		cancelForm:		_form.cancelForm.bind(_form),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.cancelForm);
	});
});

router.post('/approve', function(req, res, next) {
	var ACTION = '[approve]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _form = new FormController(req);
	async.auto({
		approveForm:		_form.approveForm.bind(_form),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.approveForm);
	});
});

module.exports = router;
