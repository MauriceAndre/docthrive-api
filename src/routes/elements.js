// external modules
const express = require("express");
const _ = require("lodash");
// middleware
const validator = require("../middleware/validator");
const validateObjectId = require("../middleware/validateObjectId");
// models
const {
  validate,
  getElement,
  update,
  cropRequest,
  cropResponse,
  cropResKeys,
} = require("../models/element");

const router = express.Router();

// add new element
router.post("/", [validator(validate)], async (req, res) => {
  const Element = await getElement(req.user._id);
  const element = new Element(cropRequest(req.body));
  await element.save();

  res.send(cropResponse(element));
});

// update element
router.put("/:id", [validateObjectId], async (req, res) => {
  const id = req.params.id;

  let element = await update(id, req.user, req.body);
  if (!element)
    return res
      .status(404)
      .send("The given element id wasn't found. Please check the id.");

  res.send(cropResponse(element));
});

// return elements
router.get("/", [], async (req, res) => {
  const Element = await getElement(req.user._id);

  let filter = req.query || {};
  filter = _.pick(filter, ["_id", "name", "type", "parentId", "labels"]);

  const elements = await Element.find(filter).select(cropResKeys.join(" "));

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

  res.send(cropResponse(element));
});

module.exports = router;
