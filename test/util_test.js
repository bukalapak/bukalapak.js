import { describe, it } from 'mocha'
import { expect } from 'chai'
import { transformUrl } from '../src/util'

let baseUrl = 'https://api.bukalapak.com'

describe('transformUrl()', () => {
  it('should return baseUrl when subdomain is not supplied', () => {
    expect(transformUrl(baseUrl)).eql(baseUrl)
  })

  it('should return modified baseUrl when subdomain passed', () => {
    expect(transformUrl(baseUrl, 'www')).eql('https://www.bukalapak.com')
  })

  it('should handle hostname without domain properly', () => {
    expect(transformUrl('http://localhost:8088', 'www')).eql('http://www.localhost:8088')
  })

  it('should return error when arguments are invalid', () => {
    expect(() => { transformUrl({}, 'www') }).throw(Error, '`baseUrl` and `subdomain` must be a string')
    expect(() => { transformUrl('', {}) }).throw(Error, '`baseUrl` and `subdomain` must be a string')
    expect(() => { transformUrl('not-url', 'www') }).throw(Error, 'not-url is not valid url')
  })
})
