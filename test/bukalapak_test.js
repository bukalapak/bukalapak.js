/*eslint no-new: 0*/

import { describe, it, before, after } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Bukalapak from '../src/bukalapak';
import queryString from 'query-string';

chai.use(chaiAsPromised);

const app = require('./app').app;

let LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./local_storage');

let baseUrl = 'http://localhost:8088';
let options = { baseUrl: baseUrl, storage: localStorage };

let Util = {
  oauthPath (params) {
    let oauthParams = { client_id: 'abcdef', client_secret: 1234567 };
    let options = Object.assign({}, params, oauthParams);

    return '/tests/oauth-token?' + queryString.stringify(options);
  }
};

describe('Bukalapak', () => {
  let client = new Bukalapak(options);

  it('should create a new instance', () => {
    expect(client).to.be.an.instanceOf(Bukalapak);
  });

  it('should raise error when no baseUrl option', () => {
    expect(() => {
      new Bukalapak({});
    }).to.throw(Error, '`baseUrl` option is required');
  });

  it('should raise error when no storage option', () => {
    expect(() => {
      new Bukalapak({ baseUrl: baseUrl });
    }).to.throw(Error, '`storage` option is required');
  });

  it('should raise error when called as function', () => {
    expect(() => {
      Bukalapak();
    }).to.throw(TypeError, 'Cannot call a class as a function');
  });

  it('should format options and remove invalid keys', () => {
    client = new Bukalapak(Object.assign(options, { invalidKey: 'foo' }));
    expect(client.options).to.eql({ baseUrl: baseUrl });
  });

  describe('http methods', () => {
    it('should support all http methods', () => {
      let methods = ['get', 'put', 'del', 'post', 'head', 'opts'];
      methods.forEach((method) => {
        expect(client[method]).to.be.a('function');
      });
    });

    it('should throw an error if path is not a string', () => {
      expect(() => {
        client.get({});
      }).to.throw(Error, '`path` must be a string');
    });

    it('should throw an error if options is not an object', () => {
      expect(() => {
        client.get('', []);
      }).to.throw(Error, '`options` must be an object');
      expect(() => {
        client.get('', 11);
      }).to.throw(Error, '`options` must be an object');
    });
  });

  describe('http interactions', () => {
    let server;
    let client = new Bukalapak(options);

    before((done) => {
      server = app.listen({ port: 8088 }, done);
    });
    after((done) => {
      server.close(done);
    });

    it('should auto set body for post request', (done) => {
      let promise = client.post('/tests/post-blank-data').then((response) => {
        return response.json();
      });
      expect(promise).to.eventually.eql({ body: {} }).notify(done);
    });

    it('should able to perform delete request', (done) => {
      let promise = client.del('/tests/methods').then((response) => {
        return response.json();
      });
      expect(promise).to.eventually.have.deep.property('method', 'DELETE').notify(done);
    });

    it('should able to perform options request', (done) => {
      let promise = client.opts('/tests/methods').then((response) => {
        return response.json();
      });
      expect(promise).to.eventually.have.deep.property('method', 'OPTIONS').notify(done);
    });

    it('should handle not authorized error properly', () => {
      let promise = client.get('/tests/unauthorized').then((response) => {
        return response.json();
      });

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('errors[0].message', 'You are not authorized'),
        expect(promise).to.eventually.have.deep.property('errors[0].code', 10001),
        expect(promise).to.eventually.have.deep.property('metadata.http_status', 401)
      ]);
    });

    it('should be able to switch baseUrl subdomain', (done) => {
      let client = new Bukalapak({ baseUrl: 'http://api.lvh.me:8088', storage: localStorage });
      let promise = client.get('/tests/domain', { subdomain: 'www' }).then((response) => {
        return response.json();
      });
      expect(promise).to.eventually.eql({ host: 'www.lvh.me:8088' }).notify(done);
    });

    it('should be able to set custom headers', () => {
      let options = { headers: { 'Accept': 'application/json', 'User-Agent': 'bukalapak.js//0.0.0' } };
      let promise = client.get('/tests/http-headers', options).then((response) => {
        return response.json();
      });

      return Promise.all([
        expect(promise).to.eventually.have.deep.property('accept', 'application/json'),
        expect(promise).to.eventually.have.deep.property('user-agent', 'bukalapak.js//0.0.0')
      ]);
    });

    describe('oauth interactions', () => {
      describe('client credentials', () => {
        it('should return error for invalid scope', () => {
          let httpPath = Util.oauthPath({ grant_type: 'client_credentials', scope: 'unkn0wn' });
          let promise = client.post(httpPath).then((response) => {
            return response.json();
          });

          return Promise.all([
            expect(promise).to.eventually.have.property('error', 'invalid_scope'),
            expect(promise).to.eventually.have.property('error_description')
          ]);
        });

        it('should generate token for valid client credentials request', () => {
          let httpPath = Util.oauthPath({ grant_type: 'client_credentials', scope: 'public' });
          let promise = client.post(httpPath).then((response) => {
            return response.json();
          });

          return Promise.all([
            expect(promise).to.eventually.have.property('token_type', 'bearer'),
            expect(promise).to.eventually.have.property('expires_in', 7200),
            expect(promise).to.eventually.have.property('scope', 'public'),
            expect(promise).to.eventually.have.property('access_token'),
            expect(promise).to.eventually.have.property('created_at'),
            expect(promise).to.not.eventually.have.property('refresh_token')
          ]);
        });
      });

      describe('resource owner password credentials', () => {
        it('should return error for missing username and password', () => {
          let httpPath = Util.oauthPath({ grant_type: 'password' });
          let promise = client.post(httpPath).then((response) => {
            return response.json();
          });

          return Promise.all([
            expect(promise).to.eventually.have.property('error', 'invalid_grant'),
            expect(promise).to.eventually.have.property('error_description')
          ]);
        });

        it('should generate token for valid resource owner password credentials request', () => {
          let httpPath = Util.oauthPath({ grant_type: 'password', scope: 'public user', username: 'foo', password: 's3cr3t' });
          let promise = client.post(httpPath).then((response) => {
            return response.json();
          });

          return Promise.all([
            expect(promise).to.eventually.have.property('token_type', 'bearer'),
            expect(promise).to.eventually.have.property('expires_in', 7200),
            expect(promise).to.eventually.have.property('scope', 'public user'),
            expect(promise).to.eventually.have.property('access_token'),
            expect(promise).to.eventually.have.property('refresh_token'),
            expect(promise).to.eventually.have.property('created_at')
          ]);
        });
      });

      describe('refresh token', () => {
        it('should return error for missing refresh_token', () => {
          let httpPath = Util.oauthPath({ grant_type: 'refresh_token', access_token: 'abcdef' });
          let promise = client.post(httpPath).then((response) => {
            return response.json();
          });

          return Promise.all([
            expect(promise).to.eventually.have.property('error', 'invalid_grant'),
            expect(promise).to.eventually.have.property('error_description')
          ]);
        });

        it('should generate token for valid refresh token request', () => {
          let httpPath = Util.oauthPath({ grant_type: 'refresh_token', scope: 'public user', access_token: 'abcdef', refresh_token: 'zxcv' });
          let promise = client.post(httpPath).then((response) => {
            return response.json();
          });

          return Promise.all([
            expect(promise).to.eventually.have.property('token_type', 'bearer'),
            expect(promise).to.eventually.have.property('expires_in', 7200),
            expect(promise).to.eventually.have.property('scope', 'public user'),
            expect(promise).to.eventually.have.property('access_token'),
            expect(promise).to.eventually.have.property('refresh_token'),
            expect(promise).to.eventually.have.property('created_at')
          ]);
        });
      });
    });
  });
});
