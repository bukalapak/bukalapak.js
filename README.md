# bukalapak.js

[![Circle CI](https://circleci.com/gh/bukalapak/bukalapak.js.svg?style=shield&circle-token=d8aa3d29804a92ce000a33c0372ac42d3ef99560)](https://circleci.com/gh/bukalapak/bukalapak.js)
[![Code Climate](https://codeclimate.com/repos/56cac426e6f128215f001042/badges/6d21f6edb6a5e05f155e/gpa.svg)](https://codeclimate.com/repos/56cac426e6f128215f001042/feed)
[![Test Coverage](https://codeclimate.com/repos/56cac426e6f128215f001042/badges/6d21f6edb6a5e05f155e/coverage.svg)](https://codeclimate.com/repos/56cac426e6f128215f001042/coverage)

Bukalapak API javascript wrapper.

## Usage

```javascript
// initialization
let client = new Bukalapak({ baseUrl: 'https://api.bukalapak.com/', storage: localStorage })

// use auth adapter
client.useAdapter('auth', { clientId: 'abcdef', clientSecret: '1234567', subdomain: 'www' })

// read-only operation, return promise, auto include `Authorization` header with token from client_credentials
client.get('/products', { query: { keywords: 'thinkpad' } })
client.api.products({ keywords: 'thinkpad' })

// api, now have `auth` method
client.auth.login('subosito@bukalapak.com', 's3cr3t-p4ssw0rd')

// accessing endpoint, return promise, , auto include `Authorization` header with token from resource_owner_password
// it will auto-refresh token when it's expired.
client.post('/me')
client.api.me() // this is just shortcut

// remove username and password pair, and use client_credentials token instead
client.auth.logout()
```

