// external modules
const express = require("express");
// utils
const logger = require("./utils/logger");

const app = express();

// init on startup
require("./startup/config")();
require("./startup/logging")();
require("./startup/db")();
require("./startup/routes")(app);

const port = process.env.PORT;
const server = app.listen(port, () =>
  logger.info(`Server is listening on port ${port}...`)
);

module.exports = server;
