import express from 'express'
import bodyParser from 'body-parser'

let fs = require('fs')
let path = require('path')

function loadFixture (filename) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), { encoding: 'utf8' })
}

let app = express()
let extended = { extended: false }

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

module.exports = app
