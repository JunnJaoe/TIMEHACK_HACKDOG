var Logger  = require('./services/Logger');
var express = require('express');
var app     = express();

require('dotenv').config();

var TimeHackMySQL = require('./services/TimeHackMySQL');
var express_configuration = require("./express-configuration");
express_configuration.init(app, express);

app.use('/v1/employees', require('./routes/employee'));
app.use('/v1/forms', require('./routes/form'));

Logger.log('info', '[TimeHackMySQLDB] Connecting to database');
let mysqlConnect = TimeHackMySQL.connect();
mysqlConnect.then((connect)=>{
  Logger.log('info', '[TimeHackMySQLDB] Database connected', connect);
}).catch((error) => {
  Logger.log('error', '[TimeHackMySQLDB] Database error in connection', error);
});

let port = process.env.PORT || 8080;
app.listen(port, function () {
	Logger.log('info', '[App] Now up and running', {port: port});
});

module.exports = app;
