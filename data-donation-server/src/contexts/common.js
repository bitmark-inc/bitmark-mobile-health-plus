let doCallback = (callback, error, result) => {
  if (typeof (callback) === 'function') {
    if (error) {
      return callback(error, result);
    }
    if (result) {
      return callback(null, result);
    }
    callback();
  }
};

module.exports = {
  doCallback: doCallback,
};