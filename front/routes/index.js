var express = require('express');
var router = express.Router();

router.get('/', function(request, response, next) {
    if(!request.session.user) {
        response.redirect('/login');
    } else {
        response.redirect('/dashboard');        
    }
});

router.get('/changerole/:roletype', function(request, response, next) {
    var role_type = request.params.roletype;

    request.session.user.access_type = role_type;
    
    if(request.query['goToPage']) {
        response.redirect('/' + request.query['goToPage']);
    } else {
        response.redirect(request.headers.referer);
    }
});

module.exports = router;