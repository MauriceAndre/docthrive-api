// external modules
const mongoose = require("mongoose");
const memoize = require("memoizee");
const config = require("config");
// utils
const logger = require("../utils/logger");

const createConn = function (url) {
  const conn = mongoose.createConnection(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  conn.then(logger.info(`Connected to ${url}`));

  return conn;
};

const getDBUrl = function (dbName) {
  const dbUrl = process.env.DB_URL;
  return `${dbUrl}/${dbName}`;
};

const getMainDb = function () {
  const mainUrl = getDBUrl(config.get("db.main"));
  return createConn(mainUrl);
};

const getUserDb = function (id) {
  logger.error(config.get("db.userPrefix"));
  const dbName = `${config.get("db.userPrefix")}${id}`;
  const userUrl = getDBUrl(dbName);

  return createConn(userUrl);
};

const user = memoize(getUserDb);

const main = memoize(getMainDb);

module.exports = { main, user };
