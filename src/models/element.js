// external modules
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const config = require("config").get("models.element");
// db
const { user } = require("../db/connection");
// utils
const { applyOptions } = require("../utils/validateUtils");
const { isMatch, cropFunc } = require("../utils/objectUtils");
// models
const { detectActivity } = require("./elementActivity");

const { name, type, parentId } = config.validate;

const elementSchema = new mongoose.Schema({
  name: { type: String, ...name },
  type: { type: Number, ...type }, // TODO: type = mongoose.Schema.ObjectId
  parentId: { type: String, ...parentId },
  labels: { type: Array }, // TODO: label = mongoose.Schema.ObjectId
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
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

  let oldElement = await Element.findById(id);
  if (!oldElement) return null;

  // only update when element changed
  if (isMatch(oldElement, data)) return oldElement;

  if (data.deleted && data.deleted !== oldElement.deleted)
    data.deletedAt = Date.now();

  await oldElement.updateOne(data);
  const newElement = await Element.findById(id);

  await detectActivity(user._id, oldElement, newElement);

  return newElement;
};

const filterKeys = ["_id", "name", "type", "parentId", "labels", "deleted"];
const reqKeys = ["name", "type", "parentId", "labels", "deleted"];
const resKeys = [
  "_id",
  "name",
  "type",
  "parentId",
  "labels",
  "deleted",
  "deletedAt",
  "createdAt",
  "updatedAt",
];

function validate(element) {
  const schema = Joi.object({
    name: applyOptions(Joi.string(), name),
    type: applyOptions(Joi.number(), type),
    parentId: applyOptions(Joi.string(), parentId),
    labels: Joi.array().items(Joi.string()),
    deleted: Joi.bool(),
  });

  return schema.validate(element);
}

module.exports = {
  validate,
  getElement,
  update,
  cropResponse: cropFunc(resKeys),
  filterKeys,
  reqKeys,
  resKeys,
};
