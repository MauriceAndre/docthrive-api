module.exports = function (req, res, next) {
  req.user = { _id: "userId" };
  next();
};
