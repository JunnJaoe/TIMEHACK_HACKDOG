const TAG        = '[employees]';
const express    = require('express');
const async      = require('async');
const Logger     = require('../services/Logger');
const router     = express.Router();

const EmployeeController = require('./controller/EmployeeController');

router.post('/login', function(req, res, next) {
	var ACTION = '[login]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _employee = new EmployeeController(req);
	async.auto({
		employeeLogin:		_employee.employeeLogin.bind(_employee),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.employeeLogin);          
	});	
});

router.post('/', function(req, res, next) {
	var ACTION = '[add]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _employee = new EmployeeController(req);
	async.auto({
		addEmployee:		_employee.addEmployee.bind(_employee),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.addEmployee);          
	});
});

router.get('/:employee_id/approver', function(req, res, next) {
	var ACTION = '[getEmployeeApprover]';
	Logger.log('debug', TAG + ACTION + ' request query', req.query);

	var _employee = new EmployeeController(req);
	async.auto({
		getApprover:		_employee.getApprover.bind(_employee),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.getApprover);          
	});
});

router.post('/:employee_id/approver', function(req, res, next) {
	var ACTION = '[getEmployeeApprover]';
	Logger.log('debug', TAG + ACTION + ' request query', req.query);

	var _employee = new EmployeeController(req);
	async.auto({
		getApprover:			_employee.getApprover.bind(_employee),
		checkApproverId:	['getApprover', _employee.checkApproverId.bind(_employee)],
		addApprover:			['checkApproverId', _employee.addApprover.bind(_employee)],
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.addApprover);          
	});
});

module.exports = router;