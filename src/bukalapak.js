import fetch from 'isomorphic-fetch'
import { transformUrl, isObject, isString, isUndefined } from './util'
import Storage from './storage'
import queryString from 'query-string'

const API_VERSION = 'v4'
const METHODS = ['get', 'put', 'del', 'post', 'head', 'opts']
const OAUTH_TOKEN_PATH = '/oauth/token'

class Bukalapak {
  constructor (options = {}) {
    this.options = { auth: {} }
    this.headers = {
      'Accept': `application/vnd.bukalapak.${API_VERSION}+json`
    }

    if (!options.baseUrl) {
      throw new Error('`baseUrl` option is required')
    } else {
      this.options.baseUrl = options.baseUrl
    }

    if (!options.storage) {
      throw new Error('`storage` option is required')
    } else {
      this.storage = new Storage(options.storage)
    }

    ['clientId', 'clientSecret', 'username', 'password', 'scope'].forEach((val) => {
      if (!isUndefined(options[val])) {
        this.options.auth[val] = options[val]
      }
    })

    METHODS.forEach((method) => {
      this[method] = this._request(method)
    })
  }

  clientCredentials () {
    return OAUTH_TOKEN_PATH + '?' + this._authTokenBuilder('client_credentials')
  }

  refreshToken () {
    return OAUTH_TOKEN_PATH + '?' + this._authTokenBuilder('refresh_token')
  }

  passwordCredentials () {
    return OAUTH_TOKEN_PATH + '?' + this._authTokenBuilder('password')
  }

  _authTokenBuilder (tokenGrant) {
    if (!(this._isAuthClientConfigured())) {
      throw new Error('Please set valid `clientId` and `clientSecret` options')
    }

    let params = {
      client_id: this.options.auth.clientId,
      client_secret: this.options.auth.clientSecret,
      scope: this.options.auth.scope
    }

    switch (tokenGrant) {
      case 'client_credentials':
        params.grant_type = 'client_credentials'
        params.scope = 'public'
        break
      case 'refresh_token':
        let accessToken = this.storage.fetchItem('access_token')

        if (accessToken == null || !(accessToken.refresh_token)) {
          throw new Error('Unable to perform refresh_token request')
        }

        params.grant_type = 'refresh_token'
        params.access_token = accessToken.access_token
        params.refresh_token = accessToken.refresh_token
        break
      case 'password':
        params.grant_type = 'password'
        params.username = this.options.auth.username
        params.password = this.options.auth.password
        break
    }

    return queryString.stringify(params)
  }

  _request (method) {
    return (path, options = {}) => {
      if (!isString(path)) { throw new Error('`path` must be a string') }
      if (!isObject(options)) { throw new Error('`options` must be an object') }

      let opts = Object.assign({}, options, {
        method: this._methodMatcher(method),
        headers: Object.assign({}, this.headers, options.headers || {})
      })

      let subdomain = opts.subdomain
      delete opts.subdomain

      let reqUrl = this._generateUrl(path, subdomain)

      // ensure body always present for POST request
      if (opts.method === 'POST' && isUndefined(opts.body)) {
        opts.body = ''
      }

      return this._fetch(reqUrl, opts)
    }
  }

  _methodMatcher (method) {
    switch (method) {
      case 'del':
        return 'DELETE'
      case 'opts':
        return 'OPTIONS'
      default:
        return method.toUpperCase()
    }
  }

  _fetch (...args) {
    return fetch(...args)
  }

  _generateUrl (path, subdomain) {
    return transformUrl(this.options.baseUrl, subdomain) + path
  }

  _isAuthClientConfigured () {
    return !(isUndefined(this.options.auth.clientId) || isUndefined(this.options.auth.clientSecret))
  }

  _isAuthResourceConfigured () {
    return !(isUndefined(this.options.auth.username) || isUndefined(this.options.auth.password))
  }
}

export default Bukalapak
