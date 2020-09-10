// external modules
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("config").get("models.user");
// db
const main = require("../db/connection").main();
// utils
const { applyOptions } = require("../utils/validateUtils");

const { firstName, lastName, email, password } = config.validate;

const userSchema = new mongoose.Schema({
  firstName: { type: String, ...firstName },
  lastName: { type: String, ...lastName },
  email: { type: String, unique: true, ...email },
  password: { type: String, ...password },
  isAdmin: { type: Boolean, default: true },
  active: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

userSchema.pre(["update", "updateOne", "save"], function (next) {
  const updatedAt = Date.now();
  this.set({ updatedAt });
  next();
});

userSchema.methods.encryptPassword = async function () {
  const salt = await bcrypt.genSalt(parseInt(process.env.PASSWORD_SALT));
  this.password = await bcrypt.hash(this.password, salt);
};

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const generateWebToken = function (user) {
  const payload = _.pick(user, ["_id", "firstName", "lastName", "isAdmin"]);

  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY);
};

userSchema.methods.generateWebToken = function () {
  return generateWebToken(this);
};

userSchema.statics.generateJWT = function (user) {
  return generateWebToken(user);
};

userSchema.statics.verifyWebToken = function (token) {
  return jwt.verify(token, process.env.JWT_PRIVATE_KEY);
};

userSchema.methods.getConfirmationURL = function (url) {
  return generateConfirmationURL(url, this._id);
};

const generateConfirmationURL = function (url, id) {
  return `${url}/${id}`;
};

const User = main.model("User", userSchema);

const reqKeys = ["firstName", "lastName", "email", "password"];

const resKeys = ["_id", "firstName", "lastName", "email"];
const cropResponse = function (user) {
  return _.pick(user, resKeys);
};

const authKeys = ["email", "password"];

function validate(user) {
  const schema = Joi.object({
    firstName: applyOptions(Joi.string(), firstName),
    lastName: applyOptions(Joi.string(), lastName),
    email: applyOptions(Joi.string().email(), email),
    password: applyOptions(Joi.string(), password),
  });

  return schema.validate(user);
}

module.exports = {
  User,
  validate,
  reqKeys,
  authKeys,
  cropResponse,
  generateConfirmationURL,
};
