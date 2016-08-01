import { describe, it } from 'mocha';
import { expect } from 'chai';
import { isObject, isString, isUndefined, isBlank } from '../src/util';

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
