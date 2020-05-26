// external modules
const winston = require("winston");

const info = (message, meta) => winston.info(message, meta);

const warn = (message, meta) => winston.warn(message, meta);

const error = (message, meta) => winston.error(message, meta);

const init = function () {
  // logging and exception handling
  winston.configure({
    transports: [
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.prettyPrint(),
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({ filename: "logs/app.log" }),
      // new winston.transports.MongoDB ({
      //     db: config.get('db.url'),
      //     level: 'error'
      // })
    ],
    exceptionHandlers: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.prettyPrint(),
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({ filename: "logs/uncaughtExceptions.log" }),
      // new winston.transports.MongoDB ({
      //     db: config.get('db.url')
      // })
    ],
  });
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
init();

module.exports = {
  init,
  info,
  warn,
  error,
};
