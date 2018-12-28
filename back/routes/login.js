const TAG        = '[employees]';
const express    = require('express');
const async      = require('async');
const Logger     = require('../services/Logger');
const router     = express.Router();

const LoginController = require('./controller/LoginController');

router.post('/', function(req, res, next) {
	var ACTION = '[login]';
	Logger.log('debug', TAG + ACTION + ' request body', req.body);

	var _login = new LoginController(req);
	async.auto({
		submitLogin:		_login.submitLogin.bind(_login),
	}, function(err, result) {
		if (err) return res.error(err);
		else return res.ok(result.submitLogin);          
	});
});

module.exports = router;
