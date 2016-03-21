/*eslint no-new: 0*/

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import Storage from '../src/storage';

let LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./local_storage');

describe('Storage', () => {
  let storage = new Storage(localStorage);

  describe('constructor', () => {
    it('should return error when no real storage supplied', () => {
      expect(() => {
        new Storage();
      }).to.throw(Error, '`storage` is required');
    });
  });

  describe('hasItem()', () => {
    before(() => {
      storage.setItem('foo', 'bar');
    });
    after(() => {
      storage.removeItem('foo');
    });

    it('should return true when exist', () => {
      expect(storage.hasItem('foo')).to.be.true;
    });

    it('should return false when the key is not exist', () => {
      expect(storage.hasItem('unknown')).to.be.false;
    });
  });

  describe('setItem()', () => {
    after(() => {
      storage.removeItem('foo');
    });

    it('should serialize object and save item', () => {
      storage.setItem('foo', { foo: 'bar' });
      expect(storage.storage.getItem('foo')).to.equal('{"foo":"bar"}');
    });

    it('should save basic type', () => {
      storage.setItem('foo', 12345);
      expect(storage.storage.getItem('foo')).to.equal('12345');
    });
  });

  describe('getItem()', () => {
    before(() => {
      storage.storage.setItem('foo', '{"foo":"bar"}');
    });
    after(() => {
      storage.removeItem('foo');
    });

    it('should return serialized object', () => {
      expect(storage.getItem('foo')).to.eql({ foo: 'bar' });
    });

    it('should return as is when no serializer support', () => {
      storage = new Storage(localStorage, { serialize: false });
      expect(storage.getItem('foo')).to.equal('{"foo":"bar"}');
    });
  });

  describe('removeItem()', () => {
    before(() => {
      storage.setItem('foo', 'bar');
      storage.setItem('baz', 'boo');
    });

    after(() => {
      storage.clear();
    });

    it('should remove selected items', () => {
      storage.removeItem('foo');

      expect(storage.getItem('foo')).to.be.null;
      expect(storage.getItem('baz')).to.equal('boo');
    });
  });

  describe('clear()', () => {
    before(() => {
      storage.setItem('foo', 'bar');
      storage.setItem('baz', 'boo');
    });

    it('should clear all saved items', () => {
      storage.clear();

      expect(storage.getItem('foo')).to.be.null;
      expect(storage.getItem('baz')).to.be.null;
    });
  });

  describe('count()', () => {
    before(() => {
      storage.setItem('foo', 'bar');
      storage.setItem('baz', 'boo');
    });

    after(() => {
      storage.clear();
    });

    it('should return correct items count', () => {
      expect(storage.count()).to.equal(2);
    });
  });
});
