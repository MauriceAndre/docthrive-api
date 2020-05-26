function applyOptions(type, options) {
  for (let key in options) {
    const value = options[key];
    type = type[key](value);
  }

  return type;
}

module.exports = { applyOptions };
