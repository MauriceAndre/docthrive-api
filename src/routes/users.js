// external modules
const express = require("express");
// middlware
const validator = require("../middleware/validator");
const cropBody = require("../middleware/cropBody");
// models
const { validate, User, reqKeys, cropResponse } = require("../models/user");

const router = express.Router();

router.post("/", [validator(validate), cropBody(reqKeys)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(500).send("User is already registred.");

  user = new User(req.body);
  await user.encryptPassword();
  await user.save();

  const token = user.generateWebToken();

  res.header("x-auth-token", token).send(cropResponse(user));
});

module.exports = router;
