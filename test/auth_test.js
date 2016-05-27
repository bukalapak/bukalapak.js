/*eslint no-new: 0*/

import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Bukalapak from '../src/bukalapak';

chai.use(chaiAsPromised);

const app = require('./app').app;
const validResponse = require('./app').validResponse;

let LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./local_storage');

let baseUrl = 'http://localhost:8088';
let options = { baseUrl: baseUrl, storage: localStorage };
let oauthParams = { clientId: 'abcdef', clientSecret: 1234567, scope: 'public user' };

describe('auth adapter', () => {
  it('should raise an error when no clientId and clientSecret supplied', () => {
    let client = new Bukalapak(options);
    expect(() => {
      client.useAdapter('auth', {});
    }).to.throw(Error, 'Please set valid `clientId` and `clientSecret` options');
  });

  it('should raise an error when no username and password pair for login', () => {
    let client = new Bukalapak(options);
    client.useAdapter('auth', oauthParams);
    expect(() => {
      client.auth.login('', '');
    }).to.throw(Error, 'Please set valid `username` and `password`');
  });

  it('invalid refresh token call', () => {
    localStorage.removeItem('access_token');
    let client = new Bukalapak(options);
    client.useAdapter('auth', oauthParams);

    expect(() => {
      client.auth.refreshToken();
    }).to.throw(Error, 'Unable to perform refresh_token request');
  });

  it('invalid resource owner password call', () => {
    localStorage.removeItem('access_token');
    let client = new Bukalapak(options);
    client.useAdapter('auth', oauthParams);

    expect(() => {
      client.auth.userAuth();
    }).to.throw(Error, 'Unable to perform resource owner password credentials request');
  });

  it('using custom subdomain', (done) => {
    localStorage.removeItem('access_token');
    let client = new Bukalapak(options);
    client.useAdapter('auth', Object.assign({}, oauthParams, { subdomain: 'accounts' }));

    expect(client.auth.clientAuth()).to.eventually.be.rejectedWith(Error, /accounts.localhost/).notify(done);
  });
});

describe('auth adapter: token', () => {
  let client = new Bukalapak(options);
  let server;

  before((done) => {
    server = app.listen({ port: 8088 }, done);
  });

  after((done) => {
    server.close(done);
  });

  beforeEach((done) => {
    client.useAdapter('auth', Object.assign({}, { tokenPath: '/tests/oauth-token' }, oauthParams)).then(() => {
      done();
    });
  });

  afterEach(() => {
    return Promise.all([ localStorage.removeItem('access_token') ]);
  });

  describe('client credentials', () => {
    it('should attach client credentials token in request headers', (done) => {
      let promise = client.get('/tests/request-token').then((response) => {
        return response.json();
      });
      let wanted = {
        accept: 'application/vnd.bukalapak.v4+json',
        authorization: `Bearer ${validResponse.clientCredentials.access_token}`
      };

      expect(promise).to.eventually.eql(wanted).notify(done);
    });
  });

  describe('resource owner password', () => {
    beforeEach((done) => {
      client.auth.login('foo', 's3cr3t').then(() => {
        done();
      });
    });

    it('should attach resource owner password token in request headers', (done) => {
      let promise = client.get('/tests/request-token').then((response) => {
        return response.json();
      });
      let wanted = {
        accept: 'application/vnd.bukalapak.v4+json',
        authorization: `Bearer ${validResponse.password.access_token}`
      };

      expect(promise).to.eventually.eql(wanted).notify(done);
    });
  });

  describe('resource owner password: logout', () => {
    beforeEach(() => {
      return Promise.all([
        client.auth.login('foo', 's3cr3t'),
        client.auth.logout()
      ]);
    });

    it('should attach client credentials token in request headers', (done) => {
      let promise = client.get('/tests/request-token').then((response) => {
        return response.json();
      });
      let wanted = {
        accept: 'application/vnd.bukalapak.v4+json',
        authorization: `Bearer ${validResponse.clientCredentials.access_token}`
      };

      expect(promise).to.eventually.eql(wanted).notify(done);
    });
  });
});

describe('auth adapter: auto refresh token', () => {
  let client = new Bukalapak(options);
  let server;

  before((done) => {
    server = app.listen({ port: 8088 }, done);
  });

  after((done) => {
    server.close(done);
  });

  beforeEach((done) => {
    client.useAdapter('auth', Object.assign({}, { tokenPath: '/tests/expired-token' }, oauthParams)).then(() => {
      done();
    });
  });

  afterEach(() => {
    return Promise.all([ localStorage.removeItem('access_token') ]);
  });

  describe('resource owner password', () => {
    beforeEach((done) => {
      client.auth.login('foo', 's3cr3t').then(() => {
        done();
      });
    });

    it('should auto-refresh resource owner password token before attach it in request headers', (done) => {
      let promise = client.get('/tests/request-token').then((response) => {
        return response.json();
      });
      let wanted = {
        accept: 'application/vnd.bukalapak.v4+json',
        authorization: `Bearer ${validResponse.refreshToken.access_token}`
      };

      expect(promise).to.eventually.eql(wanted).notify(done);
    });
  });
});

describe('auth adapter: auto refresh token with client credentials token)', () => {
  let client = new Bukalapak(options);
  let server;

  before((done) => {
    server = app.listen({ port: 8088 }, done);
  });

  after((done) => {
    server.close(done);
  });

  beforeEach((done) => {
    client.useAdapter('auth', Object.assign({}, { tokenPath: '/tests/expired-token' }, oauthParams)).then(() => {
      done();
    });
  });

  afterEach(() => {
    return Promise.all([ localStorage.removeItem('access_token') ]);
  });

  describe('resource owner password', () => {
    it('should not auto-refresh client credentials token', (done) => {
      let promise = client.get('/tests/request-token').then((response) => {
        return response.json();
      });

      let wanted = {
        accept: 'application/vnd.bukalapak.v4+json',
        authorization: `Bearer ${validResponse.clientCredentials.access_token}`
      };

      expect(promise).to.eventually.eql(wanted).notify(done);
    });
  });
});
