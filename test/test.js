/*eslint no-new: 0*/

import { describe, it } from 'mocha'
import { expect } from 'chai'
import Bukalapak from '../src/bukalapak'

let baseUrl = 'https://api.bukalapak.com'
let options = { baseUrl: baseUrl }

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
  })
})
