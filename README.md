# bukalapak.js

[![Circle CI](https://circleci.com/gh/bukalapak/bukalapak.js.svg?style=shield&circle-token=d8aa3d29804a92ce000a33c0372ac42d3ef99560)](https://circleci.com/gh/bukalapak/bukalapak.js)
[![Code Climate](https://codeclimate.com/repos/56cac426e6f128215f001042/badges/6d21f6edb6a5e05f155e/gpa.svg)](https://codeclimate.com/repos/56cac426e6f128215f001042/feed)
[![Test Coverage](https://codeclimate.com/repos/56cac426e6f128215f001042/badges/6d21f6edb6a5e05f155e/coverage.svg)](https://codeclimate.com/repos/56cac426e6f128215f001042/coverage)

Bukalapak API javascript wrapper.

## Usage

```javascript
// initialization
let api = new Bukalapak({ baseUrl: 'https://api.bukalapak.com/', storage: localStorage })

// use auth adapter
api.useAdapter('auth', { clientId: 'abcdef', clientSecret: '1234567' })

// read-only operation, return promise, auto include `Authorization` header with token from client_credentials
api.get('/products', { query: { keywords: 'thinkpad' } })
api.products({ keywords: 'thinkpad' })

// api, now have `auth` method
api.auth.login('subosito@bukalapak.com', 's3cr3t-p4ssw0rd')

// accessing endpoint, return promise, , auto include `Authorization` header with token from resource_owner_password
// it will auto-refresh token when it's expired.
api.post('/me')
api.me() // this is just shortcut

// remove username and password pair, and use client_credentials token instead
api.auth.logout()
```

