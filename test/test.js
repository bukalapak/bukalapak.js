var expect = require('chai').expect;
var bukalapak = require('../index');

describe('Bukalapak', function() {
  it('should be presents', function() {
    expect(bukalapak).to.be.a('object');
  });
});
