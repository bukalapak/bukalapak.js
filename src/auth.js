import queryString from 'query-string';
import { isBlank } from './util';

const OAUTH_TOKEN_PATH = '/oauth/token';

class Auth {
  constructor (client, options) {
    this.client = client;
    this.options = {
      isBlank (key) { return isBlank(this[key]); },
      validate (keys, message) {
        keys.forEach((key) => {
          if (this.isBlank(key)) { throw new Error(message); }
        });
      },
      toParams () {
        return {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: this.scope
        };
      },
      authPair (grantOptions) {
        return {
          username: this.username,
          password: grantOptions.password
        };
      }
    };

    this.options.fetchOptions = {};

    Object.keys(options).forEach((key) => {
      if (this._validOptionKeys().includes(key)) {
        this.options[key] = options[key];
      } else {
        this.options.fetchOptions[key] = options[key];
      }
    });

    this.options.validate(['clientId', 'clientSecret'], 'Please set valid `clientId` and `clientSecret` options');
  }

  registerAdapter () {
    let accessToken = this.client.storage.getItem('access_token');

    if (isBlank(accessToken)) {
      return this.clientAuth();
    } else {
      return new Promise((resolve, reject) => {
        resolve(accessToken);
      });
    }
  }

  login (username, password) {
    if (isBlank(username) && isBlank(password)) {
      throw new Error('Please set valid `username` and `password`');
    }

    this.options.username = username;

    return this.userAuth(password);
  }

  logout () {
    delete this.options.username;
    return this.clientAuth();
  }

  clientAuth () {
    return this._doRequest(this._authTokenUri({
      grantFlow: 'client_credentials'
    }));
  }

  userAuth (password) {
    return this._doRequest(this._authTokenUri({
      grantFlow: 'password',
      options: {
        password: password
      }
    }));
  }

  refreshToken () {
    return this._doRequest(this._authTokenUri({
      grantFlow: 'refresh_token'
    }));
  }

  formatRequest (reqUrl, options) {
    let formatOptions = (token) => {
      if (!reqUrl.match('grant_type=')) {
        options.headers['Authorization'] = `Bearer ${token.access_token}`;
      }

      return options;
    };

    return new Promise((resolve, reject) => {
      let token = this._accessToken();

      if (!isBlank(token) && token.isExpired()) {
        reject(token);
      } else {
        resolve(token);
      }
    })
      .then(formatOptions)
      .catch((token) => {
        if (!isBlank(token.refresh_token) && !reqUrl.match('refresh_token=')) {
          return this.refreshToken().then(formatOptions);
        } else {
          return new Promise((resolve, reject) => {
            this.client.storage.removeItem('access_token');
            this.clientAuth().then((token) => { resolve(formatOptions(token)); });
          });
        }
      });
  }

  _accessToken () {
    let token = this.client.storage.getItem('access_token');

    return Object.assign({}, token || {}, {
      isExpired () {
        let expiration = (this.created_at + this.expires_in) * 1000;
        return expiration <= this.now();
      },

      now () {
        return Date.now();
      }
    });
  }

  _doRequest (uri) {
    let fetchOptions = Object.assign({}, this.options.fetchOptions,
        { baseUrl: this.options.baseUrl || this.client.options.baseUrl });

    return this.client.post(uri, fetchOptions)
      .then((data) => {
        this.client.storage.setItem('access_token', data); return data;
      });
  }

  _authTokenUri (tokenGrant) {
    return this._token_path() + '?' + this._authTokenQuery(tokenGrant);
  }

  _authTokenQuery (tokenGrant) {
    return queryString.stringify(this._authTokenBuilder(tokenGrant));
  }

  _authTokenBuilder (tokenGrant) {
    switch (tokenGrant.grantFlow) {
      case 'client_credentials':
        return this._clientCredentialsBuilder();
      case 'refresh_token':
        return this._refreshTokenBuilder();
      case 'password':
        return this._passwordBuilder(tokenGrant.options);
    }
  }

  _clientCredentialsBuilder () {
    return Object.assign({}, this.options.toParams(), { grant_type: 'client_credentials', scope: 'public' });
  }

  _refreshTokenBuilder () {
    let accessToken = this.client.storage.getItem('access_token');

    if (isBlank(accessToken) || isBlank(accessToken.refresh_token)) {
      throw new Error('Unable to perform refresh_token request');
    }

    return Object.assign({}, this.options.toParams(), {
      grant_type: 'refresh_token',
      access_token: accessToken.access_token,
      refresh_token: accessToken.refresh_token
    });
  }

  _passwordBuilder (grantOptions) {
    if (isBlank(this.options.username) || isBlank(grantOptions.password)) {
      throw new Error('Unable to perform resource owner password credentials request');
    }
    return Object.assign({}, this.options.toParams(), this.options.authPair(grantOptions), { grant_type: 'password' });
  }

  _validOptionKeys () {
    return ['clientId', 'clientSecret', 'username', 'password', 'scope', 'tokenPath', 'baseUrl'];
  }

  _token_path () {
    return this.options.tokenPath || OAUTH_TOKEN_PATH;
  }
}

export default Auth;
