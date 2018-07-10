const assert = require('assert');
const express = require('express');
const supertest = require('supertest');
const use = require('superagent-use');
const captureError = require('../src/capture-error.js');

describe('Capture Error Plugin', () => {
  let request;
  let server;
  const port = process.env.PORT || 3000;
  before((done) => {
    const app = express();
    app.get('/ok', (_, res) => {
      res.status(200);
      res.send('ok');
    });
    server = app.listen(port, () => {
      request = use(supertest(`http://localhost:${port}`));
      done();
    });
  });
  after(() => {
    server.close();
  });

  it('should capture an error when it occurs', async () => {
    try {
      await request
        .use(captureError((err, test) => {
          err.message += ` at ${test.url}`;
        }))
        .get('/ok')
        .expect(500);
      throw new Error('This should not happen');
    } catch (err) {
      assert.equal(err.message, `expected 500 "Internal Server Error", got 200 "OK" at http://localhost:${port}/ok`);
    }
  });

  it('should do nothing when no error occurs', async () => {
    let capturedErr;
    let capturedTest;
    request
      .use(captureError((err, test) => {
        err.message += ` at ${test.url}`;
      }))
      .get('/ok')
      .expect(200);
    assert.equal(capturedErr, undefined);
    assert.equal(capturedTest, undefined);
  });
});
