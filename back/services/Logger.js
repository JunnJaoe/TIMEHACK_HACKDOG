var winston = require('winston');
winston.emitErrs = true;

var winstonLogger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: function() {
        return new Date().toISOString();
      },
      formatter: function(options) {
        switch (options.level) {
          case 'error' :
            options.message += " error :\n";
            break;
          default : //debug, info
            options.message += " :\n";
            break;
        }
        return winston.config.colorize(options.level, options.level.toUpperCase()) + ': ' + options.timestamp() 
          + ' ' + options.message + (options.meta.body || options.meta.stack || "");
      }
    })
  ],
  exitOnError: false
});

var Logger = {
  log: function(type, tag, body) {
    if (process.env.NODE_ENV != 'test')
      winstonLogger.log(type, tag, {body: this.formatObject(body)});
  },
  formatObject: function(obj) {
    if ((typeof obj) == 'object' && !Array.isArray(obj) && obj !== null) {
      obj = JSON.parse(JSON.stringify(obj));
      if (obj.password) {
        obj.password = '[HIDDEN]';
      }
      if (obj.account_num) {
        obj.account_num = '[HIDDEN]';
      }
      if (obj.records && Array.isArray(obj.records) && obj.records.length > 0) {
        obj.records = [];
      }
      if (obj.data && Array.isArray(obj.data) && obj.data.length > 0) {
        obj.data = [{length: obj.data.length}];
      }
      obj = JSON.stringify(obj);
    }
    if (Array.isArray(obj) && obj.length > 0) {
      obj = 'Array length = ' + obj.length;
    }
    return obj;
  },
}

module.exports = Logger;

module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};