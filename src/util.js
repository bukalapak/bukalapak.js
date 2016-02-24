export function transformUrl (baseUrl, subdomain = '') {
  if (subdomain === '') {
    return baseUrl
  }

  if (typeof baseUrl !== 'string' || typeof subdomain !== 'string') {
    throw new Error('`baseUrl` and `subdomain` must be a string')
  }

  let [proto, host] = baseUrl.split('//')

  if (typeof host === 'undefined') {
    throw new Error(`${baseUrl} is not valid url`)
  }

  let hostArr = host.split('.')

  if (hostArr.length > 1) {
    hostArr.shift()
    hostArr.unshift(subdomain)
  } else {
    hostArr.unshift(subdomain)
  }

  return [proto, '//', hostArr.join('.')].join('')
}
