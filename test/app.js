import express from 'express'
import bodyParser from 'body-parser'
import { expect } from 'chai'

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
  expect(req.body).to.be.eql({})
  res.status(201).send('')
})

app.all('/tests/methods', (req, res, next) => {
  res.status(202).json({ method: req.method })
})

app.get('/tests/domain', (req, res, next) => {
  res.status(200).json({ host: req.headers.host })
})

module.exports = app
