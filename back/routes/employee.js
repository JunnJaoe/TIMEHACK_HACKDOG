const TAG        = '[employees]';
const express    = require('express');
const async      = require('async');
const Logger     = require('../services/Logger');
const router     = express.Router();

const EmployeeController = require('./controller/EmployeeController');
const FormController = require('./controller/FormController');

router.get('/form', function(req, res, next) {
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

router.post('/form/add', function(req, res, next) {
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

router.post('/form/delete', function(req, res, next) {
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

router.post('/form/cancel', function(req, res, next) {
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

module.exports = router;
