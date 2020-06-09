// external modules
const _ = require("lodash");

function isEqual(firstArr, secondArr) {
  _.isEqual(_.sortBy(firstArr), _.sortBy(secondArr));
}

module.exports = { isEqual };
