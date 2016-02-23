/*eslint no-new: 0*/

import { describe, it } from 'mocha'
import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import Bukalapak from '../src/bukalapak'

chai.use(chaiAsPromised)

let baseUrl = 'https://api.bukalapak.com'
let options = { baseUrl: baseUrl }

let fs = require('fs')
let path = require('path')

function loadFixture (filename) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', filename), { encoding: 'utf8' })
}

describe('Bukalapak', () => {
  it('should create a new instance', () => {
    let bukalapak = new Bukalapak(options)
    expect(bukalapak).to.be.an.instanceOf(Bukalapak)
  })

  it('should raise error when no baseUrl option', () => {
    expect(() => { new Bukalapak({}) }).to.throw(Error, '`baseUrl` option is required')
  })

  it('should raise error when called as function', () => {
    expect(() => { Bukalapak(options) }).to.throw(TypeError, 'Cannot call a class as a function')
  })

  it('should format options and remove invalid keys', () => {
    let bukalapak = new Bukalapak(Object.assign(options, { invalidKey: 'foo' }))
    expect(bukalapak.options).to.eql({ baseUrl: baseUrl })
  })

  describe('http methods', () => {
    let bukalapak = new Bukalapak(options)

    it('should support all http methods', () => {
      let methods = ['get', 'put', 'del', 'post', 'head', 'opts']
      methods.forEach((method) => { expect(bukalapak[method]).to.be.a('function') })
    })

    it('should throw an error if path is not a string', () => {
      expect(() => { bukalapak.get({}) }).to.throw(Error, '`path` must be a string')
    })

    it('should throw an error if options is not an object', () => {
      expect(() => { bukalapak.get('', []) }).to.throw(Error, '`options` must be an object')
      expect(() => { bukalapak.get('', 11) }).to.throw(Error, '`options` must be an object')
    })

    it('should handle not authorized error properly', () => {
      nock(baseUrl).get('/').reply(401, loadFixture('unauthorized_error.json'))

      let promise = bukalapak.get('/').then((response) => { return response.json() })

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('errors[0].message', 'You are not authorized'),
        expect(promise).to.eventually.have.deep.property('errors[0].code', 10001),
        expect(promise).to.eventually.have.deep.property('metadata.http_status', 401)
      ])
    })
  })
})
