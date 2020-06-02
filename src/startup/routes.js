// external modules
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// middleware
const error = require("../middleware/error");
const manipulate = require("../middleware/manipulate");
// routes
const elements = require("../routes/elements");
const users = require("../routes/users");
const auth = require("../routes/auth");

module.exports = function (app) {
  // middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(manipulate);

  // routes
  app.use("/api/elements", elements);
  app.use("/api/users", users);
  app.use("/api/auth", auth);

  // catch error
  app.use(error);
};
