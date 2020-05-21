// external modules
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// middleware
const error = require("../middleware/error");

module.exports = function (app) {
  // middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // routes

  // catch error
  app.use(error);
};
