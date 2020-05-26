// external modules
const express = require("express");
const _ = require("lodash");
// middleware
const validator = require("../middleware/validator");
const validateObjectId = require("../middleware/validateObjectId");
// models
const { validate, getElement } = require("../models/element");

const router = express.Router();

// add new element
router.post("/", [validator(validate)], async (req, res) => {
  const Element = await getElement(req.user._id);
  const element = new Element(
    _.pick(req.body, ["name", "type", "parentId", "labels"])
  );
  await element.save();

  res.send(
    _.pick(element, [
      "_id",
      "name",
      "type",
      "parentId",
      "labels",
      "createdAt",
      "updatedAt",
    ])
  );
});

// update element
router.put("/:id", [validateObjectId], async (req, res) => {
  const Element = await getElement(req.user._id);
  const id = req.params.id;

  let element = await Element.findById(id);
  if (!element)
    return res
      .status(404)
      .send("The given element id wasn't found. Please check the id.");

  await element.updateOne(req.body);
  element = await Element.findById(id);

  res.send(element);
});

// return elements
router.get("/", [], async (req, res) => {
  const Element = await getElement(req.user._id);

  let filter = req.query || {};
  filter = _.pick(filter, ["_id", "name", "type", "parentId", "labels"]);

  const elements = await Element.find(filter).select("-__v");

  res.send(elements);
});

// remove element
router.delete("/:id", [validateObjectId], async (req, res) => {
  const Element = await getElement(req.user._id);

  const element = await Element.findByIdAndRemove(req.params.id);
  if (!element)
    return res
      .status(404)
      .send("The given element id wasn't found. Please check the id.");

  res.send(element);
});

module.exports = router;
