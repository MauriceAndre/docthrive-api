// external modules
const express = require("express");
const _ = require("lodash");
// middleware
const validator = require("../middleware/validator");
const validateObjectId = require("../middleware/validateObjectId");
const cropBody = require("../middleware/cropBody");
// models
const {
  validate,
  getElement,
  update,
  cropResponse,
  reqKeys,
  resKeys,
} = require("../models/element");

const router = express.Router();

// add new element
router.post("/", [validator(validate), cropBody(reqKeys)], async (req, res) => {
  const Element = await getElement(req.user._id);
  const element = new Element(req.body);
  await element.save();

  res.send(cropResponse(element));
});

// update element
router.put("/:id", [validateObjectId, cropBody(reqKeys)], async (req, res) => {
  const element = await update(req.params.id, req.user, req.body);
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

  const elements = await Element.find(filter).select(resKeys.join(" "));

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
