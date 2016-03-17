import queryString from 'query-string'

const ENDPOINTS = {
  me: { method: 'get', path: '/me' },
  products: { method: 'get', path: '/products' }
}

class Api {
  constructor (client) {
    this.client = client
  }

  registerAdapter () {
    Object.keys(ENDPOINTS).forEach((key) => {
      this[key] = this._registerHelper(key, ENDPOINTS[key])
    })
  }

  _registerHelper (name, endpoint) {
    return this._request(endpoint.method, endpoint.path)
  }

  _request (method, path) {
    return (query = {}) => {
      let queryStr = this._queryString(query)

      if (queryStr !== '') {
        path += `?${queryStr}`
      }

      return this.client[method](path, {})
    }
  }

  _queryString (query) {
    return queryString.stringify(query)
  }
}

export default Api
