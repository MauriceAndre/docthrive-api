// external modules
const mongoose = require("mongoose");
// utils
const logger = require("../utils/logger");

module.exports = function () {
  const db = process.env.DB_URL;
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(logger.info(`Connected to ${db}`));
};
