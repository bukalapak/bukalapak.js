/*eslint no-new: 0*/

import { describe, it, before, after } from 'mocha'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Bukalapak from '../src/bukalapak'

chai.use(chaiAsPromised)

const app = require('./app')

let baseUrl = 'https://api.client.com'
let mockUrl = 'http://localhost:8088'
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
    expect(() => { Bukalapak(options) }).to.throw(TypeError, 'Cannot call a class as a function')
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
    let client = new Bukalapak({ baseUrl: mockUrl })

    before((done) => { server = app.listen({ host: 'localhost', port: 8088 }, done) })
    after((done) => { server.close(done) })

    it('should auto set body for post request', (done) => {
      let promise = client.post('/blank-post').then((response) => { return response.status })
      expect(promise).to.eventually.be.equal(201).notify(done)
    })

    it('should able to perform delete request', (done) => {
      let promise = client.del('/methods').then((response) => { return response.json() })
      expect(promise).to.eventually.have.deep.property('method', 'DELETE').notify(done)
    })

    it('should able to perform options request', (done) => {
      let promise = client.opts('/methods').then((response) => { return response.json() })
      expect(promise).to.eventually.have.deep.property('method', 'OPTIONS').notify(done)
    })

    it('should handle not authorized error properly', () => {
      let client = new Bukalapak({ baseUrl: mockUrl })
      let promise = client.get('/unauthorized').then((response) => { return response.json() })

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('errors[0].message', 'You are not authorized'),
        expect(promise).to.eventually.have.deep.property('errors[0].code', 10001),
        expect(promise).to.eventually.have.deep.property('metadata.http_status', 401)
      ])
    })
  })
})
