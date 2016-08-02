import { describe, it, before, after } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Bukalapak from '../src/bukalapak';

chai.use(chaiAsPromised);

let LocalStorage = require('node-localstorage').LocalStorage;
let localStorage = new LocalStorage('./local_storage');

let baseUrl = 'http://api.blstage2.org';
let options = { baseUrl: baseUrl, storage: localStorage };
let username = 'subosito';
let password = 'PLBjwqlb6hWowBDlbqb0n2Vp0b1wky';
let oauthParams = {
  clientId: 'fdd65d2cbf8697b05722ed77c37b2f8d0b77ec08952574acc37dc904081be49e',
  clientSecret: '14924d9b892dee0c33259ceab9b881622209a597c8bae032358c44cf2daeb357',
  scope: 'public user',
  baseUrl: 'http://accounts.blstage2.org'
};

describe('integration', () => {
  let client;

  before(() => {
    localStorage.removeItem('access_token');
    client = new Bukalapak(options);
  });

  after(() => {
    localStorage.removeItem('access_token');
  });

  it('use auth adapter', () => {
    let promise = client.useAdapter('auth', oauthParams).then(() => { return client.storage.getItem('access_token'); });

    return Promise.all([
      expect(promise).to.eventually.have.property('token_type', 'bearer'),
      expect(promise).to.eventually.have.property('expires_in', 7200),
      expect(promise).to.eventually.have.property('scope', 'public'),
      expect(promise).to.eventually.have.property('access_token'),
      expect(promise).to.eventually.not.have.property('refresh_token'),
      expect(promise).to.eventually.have.property('created_at')
    ]);
  });

  it('use api adapter (as client)', () => {
    client.useAdapter('api');

    let promise = client.api.products().then((response) => { return response.json(); });

    return Promise.all([
      expect(promise).to.eventually.have.property('data'),
      expect(promise).to.eventually.have.property('meta')
    ]);
  });

  it('logged in as user', () => {
    let clientToken = client.storage.getItem('access_token');
    let promise = client.auth.login(username, password).then(() => { return client.storage.getItem('access_token'); });

    return Promise.all([
      expect(promise).to.eventually.have.property('token_type', 'bearer'),
      expect(promise).to.eventually.have.property('expires_in', 7200),
      expect(promise).to.eventually.have.property('scope', 'public user'),
      expect(promise).to.eventually.not.have.property('access_token', clientToken.access_token),
      expect(promise).to.eventually.have.property('refresh_token'),
      expect(promise).to.eventually.have.property('created_at')
    ]);
  });

  it('use api adapter (as user)', () => {
    let promise = client.api.me().then((response) => { return response.json(); });

    return Promise.all([
      expect(promise).to.eventually.have.deep.property('data.username', 'subosito'),
      expect(promise).to.eventually.have.deep.property('data.name', 'Alif Rachmawadi'),
      expect(promise).to.eventually.have.deep.property('data.email', 'subosito@bukalapak.com'),
      expect(promise).to.eventually.have.property('meta')
    ]);
  });

  it('use api adapter (as client after user logged out)', () => {
    let userToken = client.storage.getItem('access_token');
    let promise = client.auth.logout().then(() => { return client.storage.getItem('access_token'); });

    return Promise.all([
      expect(promise).to.eventually.have.property('token_type', 'bearer'),
      expect(promise).to.eventually.have.property('expires_in', 7200),
      expect(promise).to.eventually.have.property('scope', 'public'),
      expect(promise).to.eventually.not.have.property('access_token', userToken.access_token),
      expect(promise).to.eventually.not.have.property('refresh_token'),
      expect(promise).to.eventually.have.property('created_at')
    ]);
  });
});
