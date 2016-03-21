export function transformUrl (baseUrl, subdomain = '') {
  if (subdomain === '') {
    return baseUrl;
  }

  if (typeof baseUrl !== 'string' || typeof subdomain !== 'string') {
    throw new Error('`baseUrl` and `subdomain` must be a string');
  }

  let [proto, host] = baseUrl.split('//');

  if (typeof host === 'undefined') {
    throw new Error(`${baseUrl} is not valid url`);
  }

  let hostArr = host.split('.');

  if (hostArr.length > 1) {
    hostArr.shift();
    hostArr.unshift(subdomain);
  } else {
    hostArr.unshift(subdomain);
  }

  return [proto, '//', hostArr.join('.')].join('');
}

export function isObject (obj) {
  return (obj instanceof Object) && !(Array.isArray(obj));
}

export function isString (str) {
  return (typeof str === 'string');
}

export function isUndefined (thing) {
  return (typeof thing === 'undefined');
}

export function isBlank (obj) {
  return (typeof obj === 'undefined') || (obj === null) || (obj === '');
}
