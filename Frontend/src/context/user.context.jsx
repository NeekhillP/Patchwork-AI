import { useEffect, useState } from 'react'
import axios from '../config/axios'
import { UserContext } from './useUser'

function publicUser(user) {
  if (!user?.email) throw new Error('The server returned an incomplete user profile.')
  return { id: user.id || user._id, email: user.email }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    const controller = new AbortController()

    axios.get('/users/profile', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setUser(publicUser(data.user))
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return
        if (requestError.response?.status === 401) {
          localStorage.removeItem('token')
          setError('Your session has expired. Please sign in again.')
        } else {
          setError('Could not restore your session. Please sign in again.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  function signIn(session) {
    const nextUser = publicUser(session?.user)
    if (!session.token) throw new Error('The server did not return a session token.')
    localStorage.setItem('token', session.token)
    setUser(nextUser)
    setError('')
  }

  function clearSession(message = '') {
    localStorage.removeItem('token')
    setUser(null)
    setError(message)
  }

  async function signOut() {
    try {
      await axios.post('/users/logout')
    } catch (requestError) {
      if (requestError.response?.status !== 401) {
        throw new Error('Could not sign out. Please try again.', { cause: requestError })
      }
    }
    clearSession()
  }

  return (
    <UserContext.Provider value={{ user, loading, error, signIn, signOut, clearSession }}>
      {children}
    </UserContext.Provider>
  )
}
