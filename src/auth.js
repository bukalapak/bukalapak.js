import queryString from 'query-string'
import { isBlank } from './util'

const OAUTH_TOKEN_PATH = '/oauth/token'

class Auth {
  constructor (client, options) {
    this.client = client
    this.options = {
      isBlank (key) { return isBlank(this[key]) },
      toParams () {
        return {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: this.scope
        }
      },
      authPair () {
        return {
          username: this.username,
          password: this.password
        }
      }
    }

    this._validOptionKeys().forEach((val) => {
      if (!isBlank(options[val])) { this.options[val] = options[val] }
    })

    if (this.options.isBlank('clientId') && this.options.isBlank('clientSecret')) {
      throw new Error('Please set valid `clientId` and `clientSecret` options')
    }
  }

  clientCredentials () {
    return OAUTH_TOKEN_PATH + '?' + this._authTokenQuery('client_credentials')
  }

  refreshToken () {
    return OAUTH_TOKEN_PATH + '?' + this._authTokenQuery('refresh_token')
  }

  passwordCredentials () {
    return OAUTH_TOKEN_PATH + '?' + this._authTokenQuery('password')
  }

  _authTokenQuery (tokenGrant) {
    return queryString.stringify(this._authTokenBuilder(tokenGrant))
  }

  _authTokenBuilder (tokenGrant) {
    switch (tokenGrant) {
      case 'client_credentials':
        return this._clientCredentialsBuilder()
      case 'refresh_token':
        return this._refreshTokenBuilder()
      case 'password':
        return this._passwordBuilder()
    }
  }

  _clientCredentialsBuilder () {
    return Object.assign({}, this.options.toParams(), { grant_type: 'client_credentials', scope: 'public' })
  }

  _refreshTokenBuilder () {
    let accessToken = this.client.storage.getItem('access_token')

    if (isBlank(accessToken) || isBlank(accessToken.refresh_token)) {
      throw new Error('Unable to perform refresh_token request')
    }

    return Object.assign({}, this.options.toParams(), {
      grant_type: 'refresh_token',
      access_token: accessToken.access_token,
      refresh_token: accessToken.refresh_token
    })
  }

  _passwordBuilder () {
    return Object.assign({}, this.options.toParams(), this.options.authPair(), { grant_type: 'password' })
  }

  _validOptionKeys () {
    return ['clientId', 'clientSecret', 'username', 'password', 'scope']
  }
}

export default Auth
