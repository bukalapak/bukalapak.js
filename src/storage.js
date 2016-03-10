class Storage {
  constructor (storage, options = {}) {
    if (typeof storage === 'undefined') {
      throw new Error('`storage` is required')
    }

    this.storage = storage
    this.options = {}

    if (typeof options.serialize === 'boolean') {
      this.options.serialize = options.serialize
    } else {
      this.options.serialize = true
    }
  }

  hasItem (key) {
    let val = this.getItem(key)
    return !(val === null || typeof val === 'undefined')
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
}

export default Storage
