// external packages
const config = require("config");
// models
const { User } = require("../models/user");

module.exports = function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = User.verifyWebToken(token);
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(401).send("Invalid token.");
  }
};
