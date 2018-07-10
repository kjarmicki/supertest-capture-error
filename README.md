## Supertest Capture Error Plugin

This plugin allows you to capture and modify an assertion error that occured in a test.

Typical use case is to provide more debugging information when your assertion has failed.

### Installation

`npm i -D supertest-capture-error`

### Example Usage

Let's use the plugin to add request url and response body information to error messages:

```javascript
const supertest = require('supertest');
const use = require('superagent-use'); // so that we can apply capturing for each request
const captureError = require('supertest-capture-error');

// apply capturing for each request
const request = use(supertest('http://localhost'));
  .use(captureError((error, test) => {
    // modify error message to suit our needs:
    error.message += ` at ${test.url}\n` +
      `Response Body:\n${test.res.text}`;
    error.stack = ''; // this is useless anyway
  }));
```

Now, let's say that we're using Mocha and testing user creation endpoint. Our server expect user name and password,
and will respond with validation error if something went wrong. Here's how we use Supertest:

```javascript
request
  .post('/users')
  .send({name: 'john'})
  .set('Accept', 'application/json')
  .expect(201)
  .end(done);
```

Results,

without the plugin:
```
Error: expected 201 "Created", got 422 "Unprocessable Entity"
at Test._assertStatus (node_modules/supertest/lib/test.js:268:12)
at Test._assertFunction (node_modules/supertest/lib/test.js:283:11)
at Test.assert (node_modules/supertest/lib/test.js:173:18)
at assert (node_modules/supertest/lib/test.js:131:12)
at node_modules/supertest/lib/test.js:128:5
at Test.Request.callback (node_modules/superagent/lib/node/index.js:706:12)
at IncomingMessage.parser (node_modules/superagent/lib/node/index.js:906:18)
at endReadableNT (_stream_readable.js:1064:12)
at _combinedTickCallback (internal/process/next_tick.js:138:11)
at process._tickCallback (internal/process/next_tick.js:180:9)
```

with the plugin:
```
Error: expected 201 "Created", got 422 "Unprocessable Entity" at http://localhost/users
Response Body:
You need to pass the "password" field as well
```

### Possibilities

`test` object that gets passed into the plugin is quite huge and contains full request, response and
some additional Supertest data. I encourage you to inspect its properties. You can use all of that to enhance your debugging experience.