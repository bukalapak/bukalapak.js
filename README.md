# bukalapak.js

[![Build Status](https://travis-ci.org/bukalapak/bukalapak.js.svg?branch=master)](https://travis-ci.org/bukalapak/bukalapak.js)
[![Code Climate](https://codeclimate.com/github/bukalapak/bukalapak.js/badges/gpa.svg)](https://codeclimate.com/github/bukalapak/bukalapak.js)
[![Test Coverage](https://codecov.io/gh/bukalapak/bukalapak.js/branch/master/graph/badge.svg)](https://codecov.io/gh/bukalapak/bukalapak.js)
[![npm version](https://badge.fury.io/js/bukalapak.svg)](https://www.npmjs.com/package/bukalapak)

Bukalapak API javascript wrapper.

## Usage

```javascript
// initialization
let client = new Bukalapak({ baseUrl: 'https://api.bukalapak.com/', storage: localStorage });

// use auth adapter and api adapter
client.useAdapter('auth', { clientId: 'abcdef', clientSecret: '1234567', subdomain: 'accounts' });
client.useAdapter('api');

// read-only operation, return promise and auto include `Authorization` header with token from client_credentials
client.get('/products', { query: { keywords: 'thinkpad' } });
client.api.products({ keywords: 'thinkpad' }); // shortcut

// client, now have `auth` method
client.auth.login('subosito@bukalapak.com', 's3cr3t-p4ssw0rd');

// accessing endpoint, return promise and auto include `Authorization` header with token from resource_owner_password
// it will auto-refresh token when it's expired.
client.get('/me');
client.api.me(); // shortcut

// remove username and password pair, and use client_credentials token instead
client.auth.logout();

// That's it!

// Bonus: full example on how to handle promise based response
function logResponse (response) {
  console.log(response.status);
  console.log(response.statusText);
  console.log(response.headers.get('Content-Type'));
  console.log('---------------------------');

  return response;
}

function checkStatus (response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON (response) {
  return response.json();
}

client.api.products({ keywords: 'thinkpad' })
  .then(logResponse)
  .then(checkStatus)
  .then(parseJSON)
  .then(function (data) { console.log(data); })
  .catch(function (error) { console.log('ERROR: ', error); });

```

There are two optional dependencies depends on your usage:

- You must bring your own ES2015 Promise compatible polyfill if you need to support older browsers
- You must provide localStorage compatible when your environment does not support,
  or you want to use more advanced storage (see below)

## Storage Support

If you want to have storage support on node, then you can use [node-localstorage](https://github.com/lmaccherone/node-localstorage)


```javascript
let LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./local_storage');
let client = new Bukalapak({ baseUrl: 'https://api.bukalapak.com/', storage: localStorage });
```

Or if you want to use more advanced storage like [localForage](https://github.com/mozilla/localForage), then you can do:

```javascript
let storage = localforage.createInstance({ name: 'bukalapak' });
let client = new Bukalapak({ baseUrl: 'https://api.bukalapak.com/', storage: storage, storageOptions: { serialize: false } });
```
