//Setup logging

var winston = require('winston');
var logger = new winston.Logger({
  levels: {
    fatal: 4,
    error: 3,
    info: 2,
    warn: 1,
    debug: 0
  }
});
winston.config.addColors({
  fatal: 'blue',
  error: 'red',
  info: 'green',
  warn: 'yellow',
  debug: 'grey'
});

//Output Log debug messages to console, when in development mode
if (!process.env.NODE_ENV ||
    (process.env.NODE_ENV === 'development')) {
  logger.add(winston.transports.Console, { level: 'debug' });
  logger.transports.console.colorize = true;
}

var id = 0;
var log = function (module, level, uuid, message, metadata) {
  logger.log(level, JSON.stringify({
    id: id,
    timestamp: new Date(),
    module: module,
    uuid: uuid,
    level: level,
    message: message,
    metadata: metadata
  }));
  id += 1;
};

module.exports = {
  add: function (transport, options) {
    logger.add(transport, options);
  },

  remove: function (transport) {
    logger.remove(transport);
  },

  getLogger: function (options) {
    return {
      fatal: function (uuid, message, metadata) {
        log(options.module, 'fatal', uuid, message, metadata);
      },
      error: function (uuid, message, metadata) {
        log(options.module, 'error', uuid, message, metadata);
      },
      info: function (uuid, message, metadata) {
        log(options.module, 'info', uuid, message, metadata);
      },
      warn: function (uuid, message, metadata) {
        log(options.module, 'warn', uuid, message, metadata);
      },
      debug: function (uuid, message, metadata) {
        log(options.module, 'debug', uuid, message, metadata);
      }
    };
  }
};