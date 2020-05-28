// external modules
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const config = require("config").get("models.element");
// db
const { user } = require("../db/connection");
// utils
const { applyOptions } = require("../utils/validateUtils");
const { isMatch } = require("../utils/objectUtils");

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

const update = async function (id, user, data) {
  const Element = await getElement(user._id);

  let element = await Element.findById(id);
  if (!element) return null;

  // only update when element changed
  if (isMatch(element, data)) return element;

  await element.updateOne(data);
  element = await Element.findById(id);

  return element;
};

const cropRequest = function (element) {
  return _.pick(element, ["name", "type", "parentId", "labels"]);
};

const cropResKeys = [
  "_id",
  "name",
  "type",
  "parentId",
  "labels",
  "createdAt",
  "updatedAt",
];
const cropResponse = function (element) {
  return _.pick(element, cropResKeys);
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
  update,
  cropRequest,
  cropResponse,
  cropResKeys,
};
