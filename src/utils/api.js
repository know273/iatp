const normalizeBase = (base) => String(base || '').replace(/\/$/, '')

export const getApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE
  return normalizeBase(envBase || 'http://127.0.0.1:5000')
}

export const getAccessToken = () => localStorage.getItem('token') || ''
export const getRefreshToken = () => localStorage.getItem('refresh_token') || ''
export const setAccessToken = (token) => localStorage.setItem('token', token || '')
export const setRefreshToken = (token) => localStorage.setItem('refresh_token', token || '')
export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')
}

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken || refreshToken.split('.').length !== 3) return null
  const res = await fetch(`${getApiBase()}/api/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` }
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  const token = data && data.token ? String(data.token) : ''
  if (!token || token.split('.').length !== 3) return null
  setAccessToken(token)
  return token
}

export const apiFetch = async (pathOrUrl, options = {}) => {
  const url = String(pathOrUrl || '')
  const fullUrl = url.startsWith('http') ? url : `${getApiBase()}/${url.replace(/^\//, '')}`
  const opts = { ...options }
  const headers = new Headers(opts.headers || {})
  const skipAuth = Boolean(opts.skipAuth)
  const token = getAccessToken()
  if (!skipAuth && token && token.split('.').length === 3 && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  delete opts.skipAuth
  opts.headers = headers

  const res = await fetch(fullUrl, opts)
  if (res.status !== 401 || opts._retried) return res

  const nextToken = await refreshAccessToken()
  if (!nextToken) return res

  const retryOpts = { ...opts, _retried: true, headers: new Headers(opts.headers || {}) }
  retryOpts.headers.set('Authorization', `Bearer ${nextToken}`)
  return fetch(fullUrl, retryOpts)
}
