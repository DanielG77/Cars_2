const BASE = 'http://localhost:3000/api'

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  })
  if (!res.ok) {
    const text = await res.text()
    let err = text
    try { err = JSON.parse(text) } catch(e){}
    throw err
  }
  // Try parse JSON, else return text
  const txt = await res.text()
  try { return JSON.parse(txt) } catch(e) { return txt }
}

export const api = {
  get: (p) => request(p, { method: 'GET' }),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' })
}

export default api
