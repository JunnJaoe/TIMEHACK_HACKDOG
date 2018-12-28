"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');

var eim = require('./eim');
var timekeeping = require('./timekeeping');

router.get('/', function(request, response, next) {
    if(request.session.user) {
        var data = {
            page: {
                title: "EIMS | Dashboard",
                name: "eims-dashboard",
                system: 'eims',
                module: 'dashboard'
            },
            user: request.session.user,
            moment: moment
        };
        response.render('eims/dashboard.html', data);
    } else {
        response.redirect('/');
    }
});

router.use('/employee-information', eim);
router.use('/timekeeping', timekeeping);

module.exports = router;