// external modules
const _ = require("lodash");
const config = require("config");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports = function () {
  if (process.env.NODE_ENV !== "production") require("dotenv").config();

  const missingEnv = _.difference(config.get("env"), Object.keys(process.env));

  if (!!missingEnv.length)
    throw new Error(
      `Required environment variables not defined. Following environment variables are required: ${missingEnv}`
    );
};
