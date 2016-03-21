import { describe, it } from 'mocha';
import { expect } from 'chai';
import { transformUrl, isObject, isString, isUndefined, isBlank } from '../src/util';

let baseUrl = 'https://api.bukalapak.com';

describe('transformUrl()', () => {
  it('should return baseUrl when subdomain is not supplied', () => {
    expect(transformUrl(baseUrl)).eql(baseUrl);
  });

  it('should return modified baseUrl when subdomain passed', () => {
    expect(transformUrl(baseUrl, 'www')).eql('https://www.bukalapak.com');
  });

  it('should handle hostname without domain properly', () => {
    expect(transformUrl('http://localhost:8088', 'www')).eql('http://www.localhost:8088');
  });

  it('should return error when arguments are invalid', () => {
    expect(() => {
      transformUrl({}, 'www');
    }).throw(Error, '`baseUrl` and `subdomain` must be a string');
    expect(() => {
      transformUrl('', {});
    }).throw(Error, '`baseUrl` and `subdomain` must be a string');
    expect(() => {
      transformUrl('not-url', 'www');
    }).throw(Error, 'not-url is not valid url');
  });
});

describe('isObject()', () => {
  it('should be able to determine valid object', () => {
    expect(isObject({ foo: 'bar' })).to.be.true;
    expect(isObject([ 'foo', 'bar' ])).to.be.false;
    expect(isObject('foo')).to.be.false;
    expect(isObject(undefined)).to.be.false;
  });
});

describe('isString()', () => {
  it('should be able to determine valid string', () => {
    expect(isString({ foo: 'bar' })).to.be.false;
    expect(isString([ 'foo', 'bar' ])).to.be.false;
    expect(isString('foo')).to.be.true;
    expect(isString(undefined)).to.be.false;
  });
});

describe('isUndefined()', () => {
  it('should be able to determine undefined', () => {
    expect(isUndefined({ foo: 'bar' })).to.be.false;
    expect(isUndefined([ 'foo', 'bar' ])).to.be.false;
    expect(isUndefined('foo')).to.be.false;
    expect(isUndefined(undefined)).to.be.true;
  });
});

describe('isBlank()', () => {
  it('should be able to determine blank object', () => {
    expect(isBlank({ foo: 'bar' })).to.be.false;
    expect(isBlank([ 'foo', 'bar' ])).to.be.false;
    expect(isBlank('foo')).to.be.false;
    expect(isBlank(undefined)).to.be.true;
    expect(isBlank(null)).to.be.true;
    expect(isBlank('')).to.be.true;
  });
});
