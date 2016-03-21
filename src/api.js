const ENDPOINTS = {
  me: { method: 'get', path: '/me' },
  products: { method: 'get', path: '/products' }
};

class Api {
  constructor (client) {
    this.client = client;
  }

  registerAdapter () {
    Object.keys(ENDPOINTS).forEach((key) => {
      this[key] = this._registerHelper(key, ENDPOINTS[key]);
    });
  }

  _registerHelper (name, endpoint) {
    return this._request(endpoint.method, endpoint.path);
  }

  _request (method, path) {
    return (query = {}) => {
      return this.client[method](path, { query: query });
    };
  }
}

export default Api;
