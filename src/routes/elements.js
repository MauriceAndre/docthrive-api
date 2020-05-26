// external modules
const express = require("express");
const _ = require("lodash");
// middleware
const validator = require("../middleware/validator");
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

router.get("/", [], async (req, res) => {
  const Element = await getElement(req.user._id);

  let filter = req.query || {};
  filter = _.pick(filter, ["_id", "name", "type", "parentId", "labels"]);

  const elements = await Element.find(filter).select("-__v");

  res.send(elements);
});

module.exports = router;
