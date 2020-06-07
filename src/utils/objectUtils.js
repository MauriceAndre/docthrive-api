// external modules
const _ = require("lodash");

function isMatch(obj, srcObj) {
  return _.isMatchWith(obj, srcObj, (objValue, srcValue) => {
    if (Array.isArray(objValue))
      return _.isEqual(_.sortBy(objValue), _.sortBy(srcValue));
  });
}

function cropFunc(keys) {
  return (obj) => _.pick(obj, keys);
}

module.exports = {
  isMatch,
  cropFunc,
};
