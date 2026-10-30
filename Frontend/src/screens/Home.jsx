import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/useUser'

export default function Home() {
  const { user, error, signOut } = useUser()
  const [busy, setBusy] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleSignOut() {
    if (busy) return
    setBusy(true)
    setLogoutError('')
    try {
      await signOut()
    } catch (requestError) {
      setLogoutError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl">Hello, {user?.email || 'Guest'}!</h1>
      <p role="alert" className="min-h-8 py-2 text-sm text-danger">{logoutError || error}</p>
      {user
        ? <button onClick={handleSignOut} disabled={busy} className="text-link disabled:opacity-60">{busy ? 'Signing out…' : 'Sign out'}</button>
        : <Link to="/login" className="text-link">Sign in</Link>}
    </main>
  )
}
