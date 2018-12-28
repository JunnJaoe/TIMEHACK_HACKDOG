var express = require('express');
var router = express.Router();

router.get('/', function(request, response, next){
	request.session.destroy();
	response.redirect('/');
});

module.exports = router;