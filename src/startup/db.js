// external modules
const mongoose = require("mongoose");

module.exports = function () {
  require("../db/connection").main();
};
