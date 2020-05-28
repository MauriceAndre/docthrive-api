const _ = require("lodash");

module.exports = function (keys) {
  return (req, res, next) => {
    req.body = _.pick(req.body, ...keys);

    next();
  };
};
