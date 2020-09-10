// external modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const config = require("config").get("models.label");
// db
const { user, main } = require("../db/connection");
// utils
const { applyOptions } = require("../utils/validateUtils");
const { cropFunc } = require("../utils/objectUtils");

const { name } = config.validate;

const lableSchema = new mongoose.Schema({
  name: { type: String, ...name },
  custom: { type: Boolean, default: true },
});

const getLabel = async function (userId) {
  const db = await (userId ? user(userId) : main());
  const Label = db.model("Label", lableSchema);

  return Label;
};

const reqKeys = ["name", "custom"];
const resKeys = ["_id", "name", "custom"];

function validate(label) {
  const schema = Joi.object({
    name: applyOptions(Joi.string(), name),
    custom: Joi.boolean(),
  });

  return schema.validate(label);
}

module.exports = {
  getLabel,
  validate,
  reqKeys,
  cropResponse: cropFunc(resKeys),
};
