import { describe, it } from 'mocha'
import { expect } from 'chai'
import Bukalapak from '../src/bukalapak'

describe('Bukalapak', () => {
  it('should creates a new instance', () => {
    let options = { clientId: '12345', clientSecret: 's3cr3t' }
    let bukalapak = new Bukalapak(options)

    expect(bukalapak).to.be.an.instanceOf(Bukalapak)
    expect(bukalapak.getOptions()).to.equal(options)
  })

  it('should raise error when called as function', () => {
    expect(() => { Bukalapak() }).to.throw(TypeError)
  })
})

