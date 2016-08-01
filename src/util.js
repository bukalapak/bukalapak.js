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
