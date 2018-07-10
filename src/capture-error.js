module.exports = function captureError(modifier) {
  return (test) => {
    test.assert = ((originalAssert) => {
      return (resError, response, supertestCallback) => {
        let error;
        originalAssert(resError, response, (err) => {
          error = err;
        });

        if (error) {
          modifier(error, test);
        }
        supertestCallback.call(test, error, response);
      };
    })(test.assert.bind(test));
  };
};
