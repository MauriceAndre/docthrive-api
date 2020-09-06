// external modules
const express = require("express");
const config = require("config");
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

  let info = await sendMail({
    to: user.email,
    ...mail,
    context: {
      url: `${mail.context.url}/confirm/${user._id}`,
    },
  });

  const token = user.generateWebToken();

  res.header("x-auth-token", token).send(cropResponse(user));
});

module.exports = router;
