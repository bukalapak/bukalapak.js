/*eslint no-new: 0*/

import { describe, it, before, after } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Bukalapak from '../src/bukalapak';

chai.use(chaiAsPromised);

const app = require('./app').app;

let LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./local_storage');

let baseUrl = 'http://localhost:8088';
let options = { baseUrl: baseUrl, storage: localStorage };

describe('api', () => {
  let server;
  let client = new Bukalapak(options);
  client.useAdapter('api');

  before((done) => {
    server = app.listen({ port: 8088 }, done);
  });

  after((done) => {
    server.close(done);
  });

  it('should register functions', () => {
    expect(client.api).to.respondTo('me');
    expect(client.api).to.respondTo('products');
  });

  describe('me()', () => {
    it('should return valid response', () => {
      let promise = client.api.me().then((response) => {
        return response;
      });

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('accept', 'application/vnd.bukalapak.v4+json'),
        expect(promise).to.eventually.not.have.deep.property('query')
      ]);
    });

    it('should return valid response with query', () => {
      let promise = client.api.me({ foo: 'bar' }).then((response) => {
        return response;
      });

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('accept', 'application/vnd.bukalapak.v4+json'),
        expect(promise).to.eventually.have.deep.property('foo', 'bar')
      ]);
    });

    it('should return valid response with query and custom headers', () => {
      let promise = client.api.me({ foo: 'bar' }, { headers: { 'Accept': 'application/json' } }).then((response) => {
        return response;
      });

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('accept', 'application/json'),
        expect(promise).to.eventually.have.deep.property('foo', 'bar')
      ]);
    });
  });
});
