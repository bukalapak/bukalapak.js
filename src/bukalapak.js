import fetch from 'isomorphic-fetch';
import { isObject, isString, isUndefined } from './util';
import queryString from 'query-string';
import Storage from './storage';
import Auth from './auth';
import Api from './api';

const API_VERSION = 'v4';
const METHODS = ['get', 'put', 'del', 'post', 'head', 'opts'];
const AVAILABLE_ADAPTERS = { auth: Auth, api: Api };

class Bukalapak {
  constructor (options = {}) {
    this.options = {};
    this.headers = {
      'Accept': `application/vnd.bukalapak.${API_VERSION}+json`
    };

    if (!options.baseUrl) {
      throw new Error('`baseUrl` option is required');
    } else {
      this.options.baseUrl = options.baseUrl;
    }

    if (!options.storage) {
      throw new Error('`storage` option is required');
    } else {
      this.storage = new Storage(options.storage, options.storageOptions);
    }

    METHODS.forEach((method) => {
      this[method] = this._request(method);
    });
  }

  useAdapter (name, options = {}) {
    this[name] = new AVAILABLE_ADAPTERS[name](this, options);
    return this[name].registerAdapter();
  }

  _request (method) {
    return (path, options = {}) => {
      if (!isString(path)) { throw new Error('`path` must be a string'); }
      if (!isObject(options)) { throw new Error('`options` must be an object'); }

      let opts = Object.assign({}, options, {
        method: this._methodMatcher(method),
        headers: Object.assign({}, this.headers, options.headers || {})
      });

      let baseUrl = opts.baseUrl;
      delete opts.baseUrl;

      let query = opts.query;
      delete opts.query;

      let reqUrl = this._generateUrl(path, query, baseUrl);

      // ensure body always present for POST request
      if (opts.method === 'POST' && isUndefined(opts.body)) {
        opts.body = '';
      }

      // enhance this later...
      if (this.auth) {
        return this.auth.formatRequest(reqUrl, opts).then(({ url, options }) => {
          return this._fetch(url, options);
        });
      } else {
        return this._fetch(reqUrl, opts);
      }
    };
  }

  _methodMatcher (method) {
    switch (method) {
      case 'del':
        return 'DELETE';
      case 'opts':
        return 'OPTIONS';
      default:
        return method.toUpperCase();
    }
  }

  _fetch (...args) {
    return fetch(...args);
  }

  _generateUrl (path, query = {}, baseUrl = null) {
    let reqUrl = this._generateBaseUrl(baseUrl) + path;
    let reqQuery = queryString.stringify(query);

    if (reqQuery !== '') {
      return reqUrl + `?${reqQuery}`;
    } else {
      return reqUrl;
    }
  }

  _generateBaseUrl (baseUrl) {
    baseUrl = baseUrl || this.options.baseUrl;

    if (baseUrl.endsWith('/')) {
      return baseUrl.slice(0, -1);
    }

    return baseUrl;
  }
}

export default Bukalapak;
