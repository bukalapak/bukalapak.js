class Storage {
  constructor (storage, options = {}) {
    if (this._isUndefined(storage)) {
      throw new Error('`storage` is required')
    }

    this.storage = storage
    this.options = {}

    if (this._isBoolean(options.serialize)) {
      this.options.serialize = options.serialize
    } else {
      this.options.serialize = true
    }
  }

  hasItem (key) {
    let val = this.getItem(key)
    return !(this._isNull(val) || this._isUndefined(val))
  }

  setItem (key, value) {
    if (this.options.serialize) {
      value = this._encode(value)
    }

    return this.storage.setItem(key, value)
  }

  getItem (key) {
    let value = this.storage.getItem(key)

    if (this.options.serialize) {
      return this._decode(value)
    }

    return value
  }

  removeItem (key) {
    return this.storage.removeItem(key)
  }

  clear () {
    return this.storage.clear()
  }

  count () {
    return this.storage.length
  }

  _encode (value) {
    if (this._isObject(value)) {
      return JSON.stringify(value)
    } else {
      return value
    }
  }

  _decode (value) {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  _isObject (thing) {
    return (thing instanceof Object)
  }

  _isUndefined (thing) {
    return (typeof thing === 'undefined')
  }

  _isBoolean (thing) {
    return (typeof thing === 'boolean')
  }

  _isNull (thing) {
    return (thing === null)
  }
}

export default Storage
