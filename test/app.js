import express from 'express'
import bodyParser from 'body-parser'

let fs = require('fs')
let path = require('path')

function loadFixture (filename) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), { encoding: 'utf8' })
}

function formatResponse (hash, options = {}) {
  let date = Date.now()

  if (options.expired) {
    date = date - 9600
  }

  return Object.assign({}, hash, { created_at: date })
}

function isUndefined (thing) {
  return (typeof thing === 'undefined')
}

let app = express()
let extended = { extended: false }

let validResponse = {
  clientCredentials: {
    access_token: '482c2ce503090f3b3b74a388349ebfb515a7885faf0faa777e48a40ee3ebe8bc',
    token_type: 'bearer',
    expires_in: 7200,
    scope: 'public'
  },
  password: {
    access_token: '6ec2209e6387f56d865404b2ce1300a83f1d1882110a314310eac9d44f8517cb',
    token_type: 'bearer',
    expires_in: 7200,
    refresh_token: 'f130a5f7057f8942a913654692a1aa1226a61ee334705494cfa8dd5f541d447d',
    scope: 'public user'
  },
  refreshToken: {
    access_token: '744854d94e61dad0fd581428812d43436283e54b1e0ed57e5325315d9080dff1',
    token_type: 'bearer',
    expires_in: 7200,
    refresh_token: '20f5cb01963619d542330844b9b3fdb532fd3ded76cbe9145cfc470fff2fa788',
    scope: 'public user'
  }
}

let errorResponse = {
  invalidClient: {
    error: 'invalid_client',
    error_description: 'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.'
  },
  invalidScope: {
    error: 'invalid_scope',
    error_description: 'The requested scope is invalid, unknown, or malformed.'
  },
  invalidGrant: {
    error: 'invalid_grant',
    error_description: 'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.'
  }
}

app.use(bodyParser.json(extended))

app.all('/tests/unauthorized', (req, res, next) => {
  res.status(401).send(loadFixture('unauthorized_error.json'))
})

app.post('/tests/post-blank-data', (req, res, next) => {
  res.status(201).send({ body: req.body })
})

app.all('/tests/methods', (req, res, next) => {
  res.status(202).json({ method: req.method })
})

app.get('/tests/domain', (req, res, next) => {
  res.status(200).json({ host: req.headers.host })
})

app.get('/tests/http-headers', (req, res, next) => {
  res.status(200).json({ accept: req.headers.accept, 'user-agent': req.headers['user-agent'] })
})

app.route('/tests/request-token')
  .get((req, res, next) => {
    res.status(200).json({ accept: req.headers.accept, authorization: req.headers.authorization })
  })
  .post((req, res, next) => {
    res.status(200).json({ accept: req.headers.accept, params: req.params })
  })

app.post('/tests/oauth-token', (req, res, next) => {
  if (req.query.client_id === '' || req.query.client_secret === '') {
    return res.status(401).json(errorResponse.invalidClient)
  }

  switch (req.query.grant_type) {
    case 'client_credentials':
      if (req.query.scope !== 'public') {
        return res.status(401).json(errorResponse.invalidScope)
      } else {
        return res.status(200).json(formatResponse(validResponse.clientCredentials))
      }
    case 'password':
      if (!(isUndefined(req.query.username) || isUndefined(req.query.password))) {
        return res.status(200).json(formatResponse(validResponse.password))
      }
      break
    case 'refresh_token':
      if (!(isUndefined(req.query.access_token) || isUndefined(req.query.refresh_token))) {
        return res.status(200).json(formatResponse(validResponse.refreshToken))
      }
      break
  }

  res.status(401).json(errorResponse.invalidGrant)
})

app.post('/tests/expired-token', (req, res, next) => {
  if (req.query.client_id === '' || req.query.client_secret === '') {
    return res.status(401).json(errorResponse.invalidClient)
  }

  switch (req.query.grant_type) {
    case 'password':
      if (!(isUndefined(req.query.username) || isUndefined(req.query.password))) {
        return res.status(200).json(formatResponse(validResponse.password, { expired: true }))
      }
      break
    case 'refresh_token':
      if (!(isUndefined(req.query.access_token) || isUndefined(req.query.refresh_token))) {
        return res.status(200).json(formatResponse(validResponse.refreshToken))
      }
      break
  }

  res.status(401).json(errorResponse.invalidGrant)
})

app.get('/me', (req, res, next) => {
  res.status(200).json({ accept: req.headers.accept, foo: req.query.foo })
})

module.exports = {
  app,
  validResponse
}
