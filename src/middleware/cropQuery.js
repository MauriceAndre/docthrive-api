const _ = require("lodash");

module.exports = function (keys) {
  return (req, res, next) => {
    const query = req.query || {};
    req.query = _.pick(query, keys);

    next();
  };
};
