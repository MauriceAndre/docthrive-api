// external modules
const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
// middlware
const validator = require("../middleware/validator");
const cropBody = require("../middleware/cropBody");
// models
const { validate, User, reqKeys, cropResponse } = require("../models/user");
// utils
const { sendMail } = require("../utils/mail");

const router = express.Router();

router.post("/", [validator(validate), cropBody(reqKeys)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(500).send("User is already registred.");

  user = new User(req.body);
  await user.encryptPassword();
  await user.save();

  // send mail
  const mail = config.get("mail.templates.register");
  if (!mail) throw new Error("Mail template in config not defined.");

  const url = user.getConfirmationURL(`${mail.context.url}/confirm`);

  await sendMail({
    to: user.email,
    ...mail,
    context: {
      url,
    },
  });

  const token = user.generateWebToken();

  res.header("x-auth-token", token).send(cropResponse(user));
});

router.post("/confirm", [], async (req, res) => {
  const { _id } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("Invalid id.");

  const user = await User.findById(_id);
  if (!user) return res.status(404).send("Invalid confirmation id.");

  if (user.active) return res.status(500).send("User is already active.");

  user.active = true;
  await user.save();

  res.status(200).send();
});

module.exports = router;
