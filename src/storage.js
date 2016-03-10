class Storage {
  constructor (storage) {
    if (typeof storage === 'undefined') {
      throw new Error('`storage` is required')
    }

    this.storage = storage
  }

  isExist (key) {
    let val = this.storage.getItem(key)
    return (val === null || typeof val === 'undefined')
  }

  saveItem (key, value) {
    return this.storage.setItem(key, this._encode(value))
  }

  fetchItem (key) {
    return this._encode(this.storage.getItem(key))
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
