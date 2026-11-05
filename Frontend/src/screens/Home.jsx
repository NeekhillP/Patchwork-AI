import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PatchMark } from '../components/AuthLayout'
import NewProjectDialog from '../components/NewProjectDialog'
import ProjectList from '../components/ProjectList'
import Icon from '../components/WorkspaceIcon'
import { useUser } from '../context/useUser'
import useProjects from '../hooks/useProjects'

export default function Home() {
  const { user, error, signOut, clearSession } = useUser()
  const [busy, setBusy] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const { projects, loading, error: projectError, notice, refresh, addProject } = useProjects(user?.id, clearSession)
  const dialogRef = useRef(null)
  const navigate = useNavigate()
  const initial = (user?.email?.[0] || 'P').toUpperCase()
  const projectCount = (loading || projectError) && !projects.length ? '—' : projects.length

  useEffect(() => { document.title = 'Your workspace · PatchWork AI' }, [])

  function openNewProject() {
    if (!user) return navigate('/login')
    dialogRef.current.showModal()
    dialogRef.current.querySelector('input').focus()
  }

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
    <div className="min-h-dvh bg-canvas">
      <a href="#workspace" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-ink focus:p-3 focus:text-canvas">Skip to workspace</a>

      <aside className="flex items-center border-b border-line bg-panel px-5 py-5 lg:fixed lg:inset-y-0 lg:w-60 lg:flex-col lg:items-stretch lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-8">
        <Link to="/" className="flex w-fit items-center gap-2.5 rounded-sm text-lg font-semibold tracking-tight transition-colors hover:text-accent active:text-paper" aria-label="PatchWork AI home">
          <PatchMark className="h-7 w-7 text-accent" />
          <span>PatchWork <span className="font-normal text-muted">AI</span></span>
        </Link>

        <div className="mt-10 hidden items-center gap-3 rounded-xl border border-line bg-canvas/50 p-3 lg:flex">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-medium text-accent">{initial}</span>
          <div><p className="text-xs font-medium">Personal workspace</p><p className="mt-1 text-[11px] text-muted">A space to make things happen</p></div>
        </div>

        <nav aria-label="Workspace" className="mt-9 hidden lg:block">
          <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">Workspace</p>
          <a href="#projects" aria-current="page" className="flex items-center gap-3 rounded-lg bg-accent/10 px-3 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/15 active:bg-accent/20"><Icon name="folder" className="h-[18px] w-[18px]" />Projects<span className="ml-auto text-xs">{projectCount}</span></a>
          <button type="button" disabled title="Conversations are coming soon" className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted/70"><Icon name="chat" className="h-[18px] w-[18px]" />Conversations<span className="ml-auto rounded border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide">Soon</span></button>
        </nav>

        <div className="mb-8 mt-auto hidden px-3 pt-20 lg:block">
          <span className="mb-4 block h-6 w-px bg-accent/50" />
          <p className="text-lg leading-snug tracking-tight">A place for<br /><span className="font-editorial italic text-accent">every thread.</span></p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-3 lg:ml-0 lg:border-t lg:border-line lg:pt-5">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-xs font-medium sm:flex">{initial}</span>
          <div className="hidden min-w-0 flex-1 lg:block"><p className="truncate text-xs font-medium">{user?.email || 'Your workspace'}</p><p className="mt-1 text-[11px] text-muted">{user ? 'Personal account' : 'Welcome to PatchWork'}</p></div>
          {user
            ? <button onClick={handleSignOut} disabled={busy} aria-label={busy ? 'Signing out' : 'Sign out'} title={busy ? 'Signing out' : 'Sign out'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line disabled:opacity-50"><Icon name="logout" className="h-[18px] w-[18px]" /></button>
            : <Link to="/login" className="text-link text-xs">Sign in</Link>}
        </div>
      </aside>

      <div className="lg:ml-60">
        <header className="flex h-[76px] items-center justify-between border-b border-line/70 px-6 sm:px-10 xl:px-12">
          <p className="flex items-center gap-3 text-xs"><span className="text-muted">Workspace</span><span className="text-line" aria-hidden="true">/</span><span>Projects</span></p>
          <span className="flex items-center gap-2 text-[11px] text-muted"><PatchMark className="h-3 w-3 text-accent" /><span className="hidden sm:inline">A shared space for what’s next</span></span>
        </header>

        <main id="workspace" className="mx-auto max-w-[1440px] px-6 py-10 sm:px-10 sm:py-12 xl:px-12 xl:py-14">
          {(logoutError || error) && <p role="alert" className="mb-6 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">{logoutError || error}</p>}

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Room for your next idea</p>
              <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-[42px]">Your workspace.</h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted">Bring your ideas, conversations, and people together.</p>
            </div>
            <button type="button" onClick={openNewProject} className="primary-button h-11 w-fit shrink-0 gap-2.5"><Icon name="plus" className="h-[18px] w-[18px]" />New project</button>
          </div>

          <p role="status" className="mt-4 min-h-5 text-sm text-accent">{notice}</p>

          <section id="projects" aria-labelledby="projects-heading" className="mt-12 scroll-mt-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <h2 id="projects-heading" className="text-sm font-medium">Your projects</h2>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-line px-1 text-[10px] text-muted">{projectCount}</span>
              <span className="ml-1 h-px flex-1 bg-line/70" />
              {user && <button type="button" onClick={refresh} disabled={loading} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line disabled:opacity-50"><Icon name="refresh" className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />{loading ? 'Loading…' : 'Refresh projects'}</button>}
              <p className="w-full text-xs text-muted">Projects you’ve started or joined, all in one place.</p>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
              <ProjectList projects={projects} loading={loading} error={projectError} signedIn={Boolean(user)} onRetry={refresh} onCreate={openNewProject} />

              <aside aria-labelledby="workspace-note" className="flex flex-col rounded-2xl bg-paper p-7 text-canvas sm:p-8">
                <div className="flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[0.16em]">The PatchWork way</span><PatchMark className="h-5 w-5" /></div>
                <h3 id="workspace-note" className="mt-8 text-[32px] font-medium leading-[1.12] tracking-[-0.045em]">Big ideas.<br /><span className="font-editorial font-normal italic">Small beginnings.</span></h3>
                <p className="mt-5 text-xs leading-6 text-canvas/70">A project is a shared starting point. One place for the people, conversations, and ideas behind what you’re building.</p>
                <div className="mt-8 space-y-4 border-t border-canvas/15 pt-6 text-xs font-medium">
                  <p className="flex items-center gap-3"><Icon name="folder" className="h-4 w-4 text-canvas/60" />A home for your ideas</p>
                  <p className="flex items-center gap-3"><Icon name="people" className="h-4 w-4 text-canvas/60" />Room for your people</p>
                  <p className="flex items-center gap-3"><PatchMark className="h-4 w-4 text-canvas/60" />A little help from AI</p>
                </div>
                <p className="mt-auto pt-9 text-[10px] text-canvas/60">Different minds. Shared momentum.</p>
              </aside>
            </div>
          </section>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted"><span>One workspace. Many possibilities.</span><span className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-accent/70" />Made to think together</span></footer>
        </main>
      </div>

      <NewProjectDialog dialogRef={dialogRef} onCreated={addProject} />
    </div>
  )
}
