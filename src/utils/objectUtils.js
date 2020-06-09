// external modules
const _ = require("lodash");

function isMatch(obj, srcObj) {
  return _.isMatchWith(obj, srcObj, (objValue, srcValue) => {
    if (Array.isArray(objValue))
      return _.isEqual(_.sortBy(objValue), _.sortBy(srcValue));
  });
}

function diff(firstObj, secondObj) {
  const missingKeys = _.xor(_.keys(firstObj), _.keys(secondObj));
  firstObj = _.omit(firstObj, missingKeys);
  secondObj = _.omit(secondObj, missingKeys);

  const diffArr = [];

  for (const key in firstObj) {
    if (_.isEqual(firstObj[key], secondObj[key])) continue;

    diffArr.push(key);
  }

  return [...diffArr, ...missingKeys];
}

function cropFunc(keys) {
  return (obj) => _.pick(obj, keys);
}

module.exports = {
  isMatch,
  cropFunc,
  diff,
};
