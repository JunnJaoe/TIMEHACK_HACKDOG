var express = require('express');
var router = express.Router();
var moment = require('moment');

router.get('/', function(request, response, next) {
    if(request.session.user) {
        var data = {
            page: {
                title: "QBOS | Dashboard",
                name: "Dashboard"
            },
            moment: moment,
            user: request.session.user
        };
        response.render('dashboard.html', data);
    } else {
        response.redirect('/');
    }
});

module.exports = router;