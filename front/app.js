'use strict';

var Logger  = require('./services/Logger');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');

var session = require('express-session');

var helmet = require('helmet');

var app = express();

require('dotenv').config();

var TimeHackMySQL = require('./services/TimeHackMySQL');
var express_configuration = require("./express-configuration");
express_configuration.init(app, express);

Logger.log('info', '[TimeHackMySQLDB] Connecting to database');
let mysqlConnect = TimeHackMySQL.connect();
mysqlConnect.then((connect)=>{
  Logger.log('info', '[TimeHackMySQLDB] Database connected', connect);
}).catch((error) => {
  Logger.log('error', '[TimeHackMySQLDB] Database error in connection', error);
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(helmet());

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser("secretKey#questronix_1234567890"));

// serve the files out of ./public as our main files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/modules', express.static(__dirname + '/node_modules/'));

app.use(session({
    secret:'qbos',
    resave:false,
    saveUninitialized:true
}));

//caching disabled for every route
app.use(function(request, response, next) {
    response.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

app.use('/', index);
app.use('/login', login);
app.use('/dashboard', dashboard);
app.use('/eims', eims);
app.use('/logout', logout);
app.use(function(request, response, next) {
    response.status(404).render('404.html', {
        page: 'page_404',
        user: request.session.user,
        moment: require('moment')
    });
});

module.exports = app;
