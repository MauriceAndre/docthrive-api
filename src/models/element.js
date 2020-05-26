// external modules
const mongoose = require("mongoose");
const { user } = require("../db/connection");
const Joi = require("@hapi/joi");
const config = require("config").get("models.element");
// utils
const { applyOptions } = require("../utils/validateUtils");

const { name, type, parentId } = config.validate;

const elementSchema = new mongoose.Schema({
  name: { type: String, ...name },
  type: { type: Number, ...type }, // TODO: type = mongoose.Schema.ObjectId
  parentId: { type: String, ...parentId },
  labels: { type: Array }, // TODO: label = mongoose.Schema.ObjectId
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

elementSchema.pre(["update", "updateOne", "save"], function (next) {
  const updatedAt = Date.now();
  this.set({ updatedAt });
  next();
});

const getElement = async function (id) {
  const userDb = await user(id);
  const Element = userDb.model("Element", elementSchema);

  return Element;
};

function validate(element) {
  const schema = Joi.object({
    name: applyOptions(Joi.string(), name),
    type: applyOptions(Joi.number(), type),
    parentId: applyOptions(Joi.string(), parentId),
    labels: Joi.array().items(Joi.string()),
  });

  return schema.validate(element);
}

module.exports = {
  validate,
  getElement,
};
