'use strict';

module.exports = function captureError(modifier) {
  return (test) => {
    // set up a proxy to capture calls to test asserts
    test.assert = new Proxy(test.assert, {
      apply(target, thisArg, args) {
        const [resError, response, supertestCallback] = args;
        let error;
        // run assertions and capture possible error
        target.call(thisArg, resError, response, (err) => {
          error = err;
        });
        // if the error is there, pass control to the client code
        if (error) {
          modifier(error, test);
        }
        // return control to supertest
        supertestCallback.call(test, error, response);
      }
    });
  };
};
