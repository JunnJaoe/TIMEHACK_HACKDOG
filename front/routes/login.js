"use strict";

var express = require('express');
var router = express.Router();

var login_service = require('../services/login');

router.get('/', function(request, response, next) {
    if(!request.session.user) {
        var data = {
            page: {
                title: "QBOS | Log In",
                name: "Login"
            }
        };
        response.render('login.html', data);
    } else {
        response.redirect('/');
    }
});

router.post('/', function(request, response, next) {
    var username = request.body.username;
    var password = request.body.password;

    let login = login_service.login(username, password);
    login.then((data)=>{
        request.session.user = data.data
        response.json(data);
    }).catch((error)=>{
        response.json(error);
    });
});

module.exports = router;