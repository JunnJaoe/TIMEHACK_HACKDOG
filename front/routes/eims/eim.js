"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get('/', function(request, response, next) {
    if(request.session.user) {
        var data = {
            page: {
                title: "EIMS | Employee Information Module",
                name: "eims-eim",
                system: 'eims',
                module: 'employee-information'
            },
            user: request.session.user,
            moment: moment
        };
        response.render('eims/eim.html', data);
    } else {
        response.redirect('/');
    }
});

module.exports = router;