import { useEffect, useRef, useState } from 'react'
import axios from '../config/axios'
import { useUser } from '../context/useUser'
import Icon from './WorkspaceIcon'
import UserIdentity from './UserIdentity'

export default function CollaboratorPanel({ project, onClose, onAdded, onBusyChange, onAccessLost }) {
  const { user, clearSession } = useUser()
  const [users, setUsers] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [selected, setSelected] = useState([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [revision, setRevision] = useState(0)
  const [saving, setSaving] = useState(false)
  const searchRef = useRef(null)
  const submitting = useRef(false)
  const existing = new Set(project.users.map((member) => member._id))
  const results = (users || []).filter((person) => `${person.name || person.username || ''} ${person.email}`.toLowerCase().includes(search))

  useEffect(() => {
    searchRef.current?.focus()
    const controller = new AbortController()
    axios.get('/users/all', { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return
        if (!Array.isArray(data.users) || data.users.some((person) => !person?._id || typeof person.email !== 'string')) throw new Error('Invalid user response')
        setUsers(data.users.filter((person) => person._id !== user.id))
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        if (error.response?.status === 401) clearSession('Your session has expired. Please sign in again.')
        else setLoadError('Couldn’t load users. Please try again.')
      })
    return () => controller.abort()
  }, [user.id, clearSession, revision])

  function retry() {
    setLoadError('')
    setUsers(null)
    setSelected([])
    setRevision((value) => value + 1)
  }

  function toggle(id) {
    setSaveError('')
    setSelected((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id])
  }

  async function addCollaborators() {
    if (submitting.current || !selected.length) return
    submitting.current = true
    setSaving(true)
    onBusyChange(true)
    setSaveError('')
    try {
      const { data } = await axios.put('/projects/add-users', { projectId: project._id, users: selected })
      const updatedProject = data.project
      const members = updatedProject?.users
      if (updatedProject?._id !== project._id || !Array.isArray(members)
        || members.some((member) => !member?._id || typeof member.email !== 'string')
        || selected.some((id) => !members.some((member) => member._id === id))) {
        setSaveError('Membership may have changed, but the updated details could not be confirmed. Reload the project before retrying.')
        return
      }
      onAdded(updatedProject)
    } catch (error) {
      const status = error.response?.status
      if (status === 401) clearSession('Your session has expired. Please sign in again.')
      else if (status === 403) onAccessLost()
      else setSaveError(status === 404
        ? 'The project or a selected user is no longer available. Reload the page and try again.'
        : 'Couldn’t add collaborators. Your selection is kept. Please try again.')
    } finally {
      submitting.current = false
      setSaving(false)
      onBusyChange(false)
    }
  }

  return (
    <aside id="project-collaborators" aria-labelledby="collaborators-title" aria-busy={saving} className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-start justify-between px-5 pb-4 pt-5">
        <div><h2 id="collaborators-title" className="text-base font-medium tracking-tight">Add collaborators</h2><p className="mt-1.5 text-xs leading-5 text-muted">Choose who you want to build with.</p></div>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Close collaborators" className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line disabled:opacity-50"><Icon name="close" className="h-[18px] w-[18px]" /></button>
      </div>
      <form role="search" noValidate onSubmit={(event) => { event.preventDefault(); setSearch(query.trim().toLowerCase()) }} className="shrink-0 px-5 pb-4">
        <label htmlFor="collaborator-search" className="sr-only">Search users by name or email</label>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-canvas p-1.5 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/15">
          <input ref={searchRef} id="collaborator-search" inputMode="search" value={query} disabled={saving} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault() }} placeholder="Search name or email" className="h-9 min-w-0 flex-1 rounded-md bg-transparent pl-2 text-sm outline-none placeholder:text-muted/70 focus-visible:outline-none" />
          {(query || search) && <button type="button" disabled={saving} aria-label="Clear user search" onClick={() => { setQuery(''); setSearch(''); searchRef.current.focus() }} className="flex h-9 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line disabled:opacity-50"><Icon name="close" className="h-4 w-4" /></button>}
          <button type="submit" disabled={saving} aria-label="Search users" title="Search users" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-raised text-accent transition-colors hover:bg-line active:bg-accent/20 disabled:opacity-50"><Icon name="search" className="h-[18px] w-[18px]" /></button>
        </div>
      </form>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {loadError ? <div role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger"><p>{loadError}</p><button type="button" onClick={retry} className="text-link mt-2 min-h-9 text-xs">Try again</button></div>
          : !users ? <p role="status" className="py-8 text-center text-sm text-muted">Loading users…</p>
            : <>
              <p role="status" className="px-1 pb-3 text-[11px] text-muted">{results.length} {results.length === 1 ? 'user' : 'users'}{search && ' found'}</p>
              {results.length ? <ul className="space-y-2" aria-label="Available collaborators">
                {results.map((person) => {
                  const added = existing.has(person._id)
                  const checked = added || selected.includes(person._id)
                  return <li key={person._id}><label className={`flex items-center gap-3 rounded-xl border px-3.5 py-4 transition-colors ${added || saving ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-raised/60'} ${checked ? 'border-accent/30 bg-accent/5' : 'border-line/70 bg-canvas/40'}`}>
                    <UserIdentity person={person} />
                    {added && <span className="max-w-12 text-[9px] leading-4 text-muted">Already added</span>}
                    <input type="checkbox" checked={checked} disabled={added || saving} onChange={() => toggle(person._id)} aria-label={`${added ? 'Already added' : 'Select'} ${person.email}`} className="h-4 w-4 shrink-0 accent-accent" />
                  </label></li>
                })}
              </ul> : <p className="px-4 py-8 text-center text-sm leading-6 text-muted">{search ? 'No users match this search. Try another name or email.' : 'No other users yet. Registered users will appear here.'}</p>}
            </>}
      </div>
      <div className="shrink-0 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p role="alert" className="mb-3 text-xs leading-5 text-danger">{saveError}</p>
        <p role="status" className="sr-only">{saving ? 'Adding collaborators. Please wait.' : ''}</p>
        <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted">{selected.length} selected</span><button type="button" onClick={addCollaborators} disabled={saving || !users || Boolean(loadError) || !selected.length} className="primary-button h-11 w-[180px] text-xs">{saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/30 border-t-canvas" aria-hidden="true" />Adding…</> : <>Add {selected.length > 1 ? 'collaborators' : 'collaborator'}<Icon name="plus" className="h-4 w-4" /></>}</button></div>
      </div>
    </aside>
  )
}
