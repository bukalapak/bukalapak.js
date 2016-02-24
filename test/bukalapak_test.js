/*eslint no-new: 0*/

import { describe, it, before, after } from 'mocha'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Bukalapak from '../src/bukalapak'

chai.use(chaiAsPromised)

const app = require('./app')

let baseUrl = 'http://localhost:8088'
let options = { baseUrl: baseUrl }

describe('Bukalapak', () => {
  let client = new Bukalapak(options)

  it('should create a new instance', () => {
    expect(client).to.be.an.instanceOf(Bukalapak)
  })

  it('should raise error when no baseUrl option', () => {
    expect(() => { new Bukalapak({}) }).to.throw(Error, '`baseUrl` option is required')
  })

  it('should raise error when called as function', () => {
    expect(() => { Bukalapak() }).to.throw(TypeError, 'Cannot call a class as a function')
  })

  it('should format options and remove invalid keys', () => {
    client = new Bukalapak(Object.assign(options, { invalidKey: 'foo' }))
    expect(client.options).to.eql({ baseUrl: baseUrl })
  })

  describe('http methods', () => {
    it('should support all http methods', () => {
      let methods = ['get', 'put', 'del', 'post', 'head', 'opts']
      methods.forEach((method) => { expect(client[method]).to.be.a('function') })
    })

    it('should throw an error if path is not a string', () => {
      expect(() => { client.get({}) }).to.throw(Error, '`path` must be a string')
    })

    it('should throw an error if options is not an object', () => {
      expect(() => { client.get('', []) }).to.throw(Error, '`options` must be an object')
      expect(() => { client.get('', 11) }).to.throw(Error, '`options` must be an object')
    })
  })

  describe('http interactions', () => {
    let server
    let client = new Bukalapak(options)

    before((done) => { server = app.listen({ port: 8088 }, done) })
    after((done) => { server.close(done) })

    it('should auto set body for post request', (done) => {
      let promise = client.post('/tests/post-blank-data').then((response) => { return response.json() })
      expect(promise).to.eventually.eql({ body: {} }).notify(done)
    })

    it('should able to perform delete request', (done) => {
      let promise = client.del('/tests/methods').then((response) => { return response.json() })
      expect(promise).to.eventually.have.deep.property('method', 'DELETE').notify(done)
    })

    it('should able to perform options request', (done) => {
      let promise = client.opts('/tests/methods').then((response) => { return response.json() })
      expect(promise).to.eventually.have.deep.property('method', 'OPTIONS').notify(done)
    })

    it('should handle not authorized error properly', () => {
      let promise = client.get('/tests/unauthorized').then((response) => { return response.json() })

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('errors[0].message', 'You are not authorized'),
        expect(promise).to.eventually.have.deep.property('errors[0].code', 10001),
        expect(promise).to.eventually.have.deep.property('metadata.http_status', 401)
      ])
    })

    it('should be able to switch baseUrl subdomain', (done) => {
      let client = new Bukalapak({ baseUrl: 'http://api.lvh.me:8088' })
      let promise = client.get('/tests/domain', { subdomain: 'www' }).then((response) => { return response.json() })
      expect(promise).to.eventually.eql({ host: 'www.lvh.me:8088' }).notify(done)
    })

    it('should be able to set custom headers', () => {
      let options = { headers: { 'Accept': 'application/json', 'User-Agent': 'bukalapak.js//0.0.0' } }
      let promise = client.get('/tests/http-headers', options).then((response) => { return response.json() })

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('accept', 'application/json'),
        expect(promise).to.eventually.have.deep.property('user-agent', 'bukalapak.js//0.0.0')
      ])
    })
  })
})
