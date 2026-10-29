import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { PatchMark } from './AuthLayout'
import { authRequest } from '../lib/auth'

export default function AuthForm({ mode, onAuthenticated, values, onEmailChange, onPasswordChange, onSubmit }) {
  const registering = mode === 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const formRef = useRef(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const fields = new FormData(event.currentTarget)
    const email = fields.get('email').trim().toLowerCase()
    const password = fields.get('password')
    const nextErrors = {}
    if (email.length < 5 || email.length > 50 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address (5–50 characters).'
    }
    if (password.length < 6) nextErrors.password = 'Use at least 6 characters for your password.'
    setErrors(nextErrors)
    setError('')
    if (Object.keys(nextErrors).length) {
      formRef.current.elements[Object.keys(nextErrors)[0]].focus()
      return
    }
    submitting.current = true
    setBusy(true)
    try {
      const session = await (onSubmit ? onSubmit({ email, password }) : authRequest(mode, { email, password }))
      formRef.current.reset()
      onAuthenticated(session)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  return (
    <AuthLayout title={registering ? 'Create an account' : 'Sign in'}>
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-raised text-accent"><PatchMark className="h-5 w-5" /></div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">{registering ? 'Make room for your next idea' : 'Pick up where you left off'}</p>
      <h1 className="text-[32px] font-medium leading-tight tracking-[-0.04em] sm:text-[36px]">{registering ? 'Start something together.' : 'Welcome back.'}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{registering ? 'Create your account. Find your people. Get thinking.' : 'Sign in to your people, projects, and possibilities.'}</p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={busy} className="mt-9">
        <div>
          <label htmlFor="email" className="mb-2.5 block text-sm font-medium">Email address</label>
          <input id="email" name="email" type="email" value={values?.email} onChange={onEmailChange} autoComplete="email" placeholder="you@example.com" required minLength={5} maxLength={50} disabled={busy} aria-invalid={Boolean(errors.email)} aria-describedby="email-error" className="auth-input" />
          <p id="email-error" className="min-h-7 pt-1.5 text-xs text-danger">{errors.email}</p>
        </div>
        <div className="mt-2">
          <label htmlFor="password" className="mb-2.5 block text-sm font-medium">Password</label>
          <div className="relative">
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={values?.password} onChange={onPasswordChange} autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'Create a password' : 'Enter your password'} required minLength={6} disabled={busy} aria-invalid={Boolean(errors.password)} aria-describedby="password-help" className="auth-input pr-14" />
            <button type="button" disabled={busy} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} title={showPassword ? 'Hide password' : 'Show password'} className="absolute right-1 top-1 flex h-10 w-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink active:text-accent disabled:opacity-50">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
                {showPassword && <path d="m3 3 18 18" />}
              </svg>
            </button>
          </div>
          <p id="password-help" className={`min-h-7 pt-1.5 text-xs ${errors.password ? 'text-danger' : 'text-muted'}`}>{errors.password || (registering ? 'At least 6 characters. Make it your own.' : '')}</p>
        </div>
        <div className="flex min-h-[60px] items-center py-2 text-xs leading-5 text-danger" role="alert">{error}</div>
        <button disabled={busy} className="primary-button" type="submit">
          {busy ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/30 border-t-canvas" aria-hidden="true" />{registering ? 'Creating account…' : 'Signing in…'}</> : <>{registering ? 'Create account' : 'Sign in'}<span aria-hidden="true">↗</span></>}
        </button>
        <p className="sr-only" role="status">{busy ? (registering ? 'Creating your account. Please wait.' : 'Signing in. Please wait.') : ''}</p>
      </form>

      <p className="mt-7 text-center text-sm text-muted">{registering ? 'Already part of the conversation?' : 'New to PatchWork AI?'}{' '}<Link to={registering ? '/login' : '/register'} className="text-link">{registering ? 'Sign in' : 'Create an account'}</Link></p>
      <div className="mt-10 flex items-center justify-center gap-2 border-t border-line pt-6 text-xs text-muted"><span className="h-1 w-1 rounded-full bg-accent" />Think together. Build together.</div>
    </AuthLayout>
  )
}
