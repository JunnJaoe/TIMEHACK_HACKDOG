const TAG        = '[employees]';
const express    = require('express');
const async      = require('async');
const Logger     = require('../services/Logger');
const router     = express.Router();

const ApproverController = require('./controller/ApproverController');

router.get('/form', function(req, res, next) {
	var ACTION = '[view]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _form = new ApproverController(req);
	async.auto({
		viewForms:		_form.viewForms.bind(_form),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.viewForms);
	});
});

router.post('/form/approve', function(req, res, next) {
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

// router.get('/:employee_id/approver', function(req, res, next) {
// 	var ACTION = '[getApproverApprover]';
// 	Logger.log('debug', TAG + ACTION + ' request query', req.query);
//
// 	var _approver = new ApproverController(req);
// 	async.auto({
// 		getApprover:		_approver.getApprover.bind(_approver),
// 	}, function(err, result) {
// 		if (err) return res.error(err);
// 		else return res.ok(result.getApprover);
// 	});
// });
//
// router.post('/:employee_id/approver', function(req, res, next) {
// 	var ACTION = '[getApproverApprover]';
// 	Logger.log('debug', TAG + ACTION + ' request query', req.query);
//
// 	var _approver = new ApproverController(req);
// 	async.auto({
// 		getApprover:			_approver.getApprover.bind(_approver),
// 		checkApproverId:	['getApprover', _approver.checkApproverId.bind(_approver)],
// 		addApprover:			['checkApproverId', _approver.addApprover.bind(_approver)],
// 	}, function(err, result) {
// 		if (err) return res.error(err);
// 		else return res.ok(result.addApprover);
// 	});
// });

module.exports = router;
