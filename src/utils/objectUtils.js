// external modules
const _ = require("lodash");

function isMatch(obj, srcObj) {
  return _.isMatchWith(obj, srcObj, (objValue, srcValue) => {
    if (Array.isArray(objValue))
      return _.isEqual(_.sortBy(objValue), _.sortBy(srcValue));
  });
}

module.exports = {
  isMatch,
};
