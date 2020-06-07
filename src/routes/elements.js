// external modules
const express = require("express");
const _ = require("lodash");
// middleware
const auth = require("../middleware/auth");
const validator = require("../middleware/validator");
const validateObjectId = require("../middleware/validateObjectId");
const cropBody = require("../middleware/cropBody");
const cropQuery = require("../middleware/cropQuery");
// models
const {
  validate,
  getElement,
  update,
  cropResponse,
  filterKeys,
  reqKeys,
  resKeys,
} = require("../models/element");

const router = express.Router();

// add new element
router.post(
  "/",
  [auth, validator(validate), cropBody(reqKeys)],
  async (req, res) => {
    const Element = await getElement(req.user._id);
    const element = new Element(req.body);
    await element.save();

    res.send(cropResponse(element));
  }
);

// update element
router.put(
  "/:id",
  [auth, validateObjectId, cropBody(reqKeys)],
  async (req, res) => {
    const element = await update(req.params.id, req.user, req.body);
    if (!element)
      return res
        .status(404)
        .send("The given element id wasn't found. Please check the id.");

    res.send(cropResponse(element));
  }
);

// return elements
router.get("/", [auth, cropQuery(filterKeys)], async (req, res) => {
  const Element = await getElement(req.user._id);

  const elements = await Element.find(req.query).select(resKeys.join(" "));

  res.send(elements);
});

// remove element
router.delete("/:id", [auth, validateObjectId], async (req, res) => {
  const Element = await getElement(req.user._id);

  const element = await Element.findByIdAndRemove(req.params.id);
  if (!element)
    return res
      .status(404)
      .send("The given element id wasn't found. Please check the id.");

  res.send(cropResponse(element));
});

module.exports = router;
