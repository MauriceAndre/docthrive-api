// external modules
const express = require("express");
const Joi = require("@hapi/joi");
// models
const { User, authKeys } = require("../models/user");
// middlware
const cropBody = require("../middleware/cropBody");
const validator = require("../middleware/validator");

const router = express.Router();

router.post(
  "/",
  [validator(validate), cropBody(authKeys)],
  async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).send("Invalid email or password.");

    const match = await user.comparePassword(req.body.password);
    if (!match) return res.status(401).send("Invalid email or password.");

    const token = user.generateWebToken();
    res.send(token);
  }
);

function validate(login) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(login);
}

module.exports = router;
