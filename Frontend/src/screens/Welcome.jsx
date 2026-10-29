import { useRef, useState } from 'react'
import AuthLayout, { PatchMark } from '../components/AuthLayout'
import { authRequest } from '../lib/auth'

export default function Welcome({ session, onSignOut }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)

  async function signOut() {
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setError('')
    try {
      await authRequest('logout', { token: session.token })
      onSignOut()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Welcome">
      <PatchMark className="mb-8 h-10 w-10 text-accent" />
      <p className="mb-3 text-xs uppercase tracking-widest text-accent" role="status">You’re signed in</p>
      <h1 className="text-4xl font-medium tracking-tight">You’re part of the patchwork.</h1>
      <p className="mt-5 break-all text-sm text-ink">{session.user.email}</p>
      <p className="mt-3 text-sm leading-7 text-muted">Your account is ready. The collaborative workspace is still taking shape. Come back soon for your first conversation.</p>
      <p role="alert" className="mt-5 min-h-12 text-xs leading-5 text-danger">{error}</p>
      <button onClick={signOut} disabled={busy} className="primary-button">{busy ? 'Signing out…' : 'Sign out'}</button>
    </AuthLayout>
  )
}
