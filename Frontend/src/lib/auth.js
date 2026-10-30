const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function authRequest(action, { email, password, token } = {}) {
  let response
  try {
    response = await fetch(`${apiUrl}/users/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      body: token ? undefined : JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('We couldn’t reach the server. Check your connection and try again.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (action === 'login' && [400, 401, 404].includes(response.status)) {
      throw new Error('Email or password is incorrect. Check both and try again.')
    }
    if (action === 'register' && (response.status === 409 || /E11000|duplicate key/i.test(data.message || ''))) {
      throw new Error('An account with this email already exists. Sign in instead.')
    }
    throw new Error(response.status === 400 ? 'Check your email and password, then try again.' : 'Something went wrong. Please try again in a moment.')
  }
  if (action === 'logout') return
  if (!data.token || !data.user?.email) throw new Error('The server returned an incomplete response. Please try again.')
  // Retain only public fields, excluding any password hash in the registration response.
  return { token: data.token, user: { id: data.user.id || data.user._id, email: data.user.email } }
}
