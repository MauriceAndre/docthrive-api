const _ = require("lodash");

module.exports = function (keys) {
  return (req, res, next) => {
    const body = req.body || {};
    req.body = _.pick(body, keys);

    next();
  };
};
