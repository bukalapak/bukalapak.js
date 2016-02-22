"use strict";

var expect = require('chai').expect;
var Bukalapak = require('../index');

describe('Bukalapak', function() {
  it('should creates a new instance', function() {
    var options = { clientId: '12345', clientSecret: 's3cr3t' };
    var bukalapak = new Bukalapak(options);

    expect(bukalapak).to.be.an.instanceOf(Bukalapak);
    expect(bukalapak.getOptions()).to.equal(options);
  });

  it('should raise error when called as function', function() {
    expect(function() { Bukalapak(); }).to.throw(TypeError);
  });
});

