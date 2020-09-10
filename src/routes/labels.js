// external modules
const express = require("express");
// middleware
const auth = require("../middleware/auth");
const validator = require("../middleware/validator");
const cropBody = require("../middleware/cropBody");
// models
const {
  getLabel,
  validate,
  cropResponse,
  reqKeys,
} = require("../models/label");

const route = express.Router();

route.post(
  "/",
  [auth, cropBody(reqKeys), validator(validate)],
  async (req, res) => {
    const Label = await getLabel(req.user._id);
    const label = new Label(req.body);
    await label.save();

    res.send(cropResponse(label));
  }
);

module.exports = route;
