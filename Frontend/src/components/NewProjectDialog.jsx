import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../config/axios'
import { useUser } from '../context/useUser'
import Icon from './WorkspaceIcon'

export default function NewProjectDialog({ dialogRef, onCreated }) {
  const { user, clearSession } = useUser()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [failure, setFailure] = useState(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (nameError && !saving) inputRef.current?.focus()
  }, [nameError, saving])

  function resetForm() {
    setName('')
    setNameError('')
    setFailure(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current || !user) return
    const projectName = name.trim()
    setFailure(null)
    if (!projectName || projectName.length > 100) {
      setNameError('Enter a project name between 1 and 100 characters.')
      return
    }
    setNameError('')
    submitting.current = true
    setSaving(true)

    try {
      const { data } = await axios.post('/projects/create', { name: projectName })
      if (!data.project?._id || typeof data.project.name !== 'string') {
        setFailure({ message: 'The server did not return the project details. Creation could not be confirmed.' })
        return
      }
      onCreated(data.project)
      dialogRef.current.close()
    } catch (error) {
      const status = error.response?.status
      if (status === 409) {
        setNameError('A project with this name already exists. Choose a different name.')
      } else if (status === 400) {
        setNameError('Check your project name and try again.')
      } else {
        if (status === 401) clearSession('Your session has expired. Please sign in again.')
        setFailure({ status, message: status === 401
          ? 'Your session has expired. Sign in to create this project.'
          : !error.response
            ? 'We couldn’t confirm creation. Check your connection. The project may have been saved; retrying its name may return a duplicate warning.'
            : 'Could not create project. Please try again in a moment.' })
      }
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <dialog ref={dialogRef} onClose={resetForm} onCancel={(event) => { if (submitting.current) event.preventDefault() }} aria-labelledby="new-project-title" aria-describedby="new-project-description" className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-line bg-panel p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent"><Icon name="folder" /></span>
          <button type="button" disabled={saving} onClick={() => dialogRef.current.close()} aria-label="Close new project dialog" className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line disabled:opacity-50"><Icon name="close" /></button>
        </div>
        <h2 id="new-project-title" className="mt-6 text-2xl font-medium tracking-tight">Give your idea a home.</h2>
        <p id="new-project-description" className="mt-2 text-sm leading-6 text-muted">Start with a name. The possibilities can come later.</p>
        <form noValidate onSubmit={handleSubmit} aria-busy={saving} className="mt-7">
          <label htmlFor="project-name" className="mb-2.5 block text-sm font-medium">Project name</label>
          <input ref={inputRef} id="project-name" name="name" value={name} onChange={(event) => { setName(event.target.value); setNameError('') }} autoComplete="off" placeholder="e.g. The next big idea" maxLength={100} required disabled={saving} aria-invalid={Boolean(nameError)} aria-describedby="project-name-help" className="auth-input" />
          <p id="project-name-help" className={`mt-2 min-h-8 text-xs ${nameError ? 'text-danger' : 'text-muted'}`}>{nameError || 'Keep it simple. Up to 100 characters.'}</p>
          <div role="alert" className="min-h-[72px] py-2 text-xs leading-5 text-danger">{failure?.message}{failure?.status === 401 && <>{' '}<Link to="/login" className="text-link">Sign in</Link></>}</div>
          <div className="mt-3 flex items-center justify-end gap-3 border-t border-line pt-5">
            <button type="button" disabled={saving} onClick={() => dialogRef.current.close()} className="h-11 rounded-lg border border-line px-4 text-sm font-medium transition-colors hover:bg-raised active:bg-line disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || !user} className="primary-button h-11 w-[166px]">{saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/30 border-t-canvas" aria-hidden="true" />Creating…</> : <><Icon name="plus" className="h-4 w-4" />Create project</>}</button>
          </div>
          <p role="status" className="sr-only">{saving ? 'Creating your project. Please wait.' : ''}</p>
        </form>
      </div>
    </dialog>
  )
}
