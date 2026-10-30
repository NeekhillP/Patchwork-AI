import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PatchMark } from '../components/AuthLayout'
import { useUser } from '../context/useUser'

const iconPaths = {
  plus: 'M12 5v14M5 12h14',
  folder: 'M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z',
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a8.5 8.5 0 0 1 17 0ZM7 10h7M7 14h4',
  people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  arrow: 'M7 17 17 7M7 7h10v10',
  logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14 8l4 4-4 4M8 12h12',
  close: 'm6 6 12 12M6 18 18 6',
}

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  )
}

function ProjectArtwork() {
  return (
    <svg className="h-40 w-40" viewBox="0 0 160 160" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="66" height="66" rx="16" className="fill-accent" />
      <path d="M42 22v40M22 42h40M28 28l28 28m0-28L28 56" className="stroke-canvas" strokeWidth="7" />
      <g transform="rotate(7 117 42)">
        <rect x="84" y="9" width="66" height="66" rx="6" className="fill-paper" />
        <path d="M97 29h39M97 41h28M97 53h34" className="stroke-canvas/40" strokeWidth="2" />
      </g>
      <rect x="9" y="85" width="66" height="66" rx="6" className="fill-raised stroke-line" />
      <path d="M25 112h34M25 122h22" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
      <rect x="85" y="85" width="66" height="66" rx="16" className="stroke-accent/50" strokeDasharray="4 5" />
      <path d="M118 106v24M106 118h24" className="stroke-accent/70" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function NewProjectDialog({ dialogRef }) {
  return (
    <dialog ref={dialogRef} aria-labelledby="new-project-title" aria-describedby="new-project-description" className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-line bg-panel p-0 text-ink shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent"><Icon name="folder" /></span>
          <button type="button" onClick={() => dialogRef.current.close()} aria-label="Close new project dialog" className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line"><Icon name="close" /></button>
        </div>
        <h2 id="new-project-title" className="mt-6 text-2xl font-medium tracking-tight">Give your idea a home.</h2>
        <p id="new-project-description" className="mt-2 text-sm leading-6 text-muted">Start with a name. The possibilities can come later.</p>
        <form noValidate onSubmit={(event) => event.preventDefault()} className="mt-7">
          <label htmlFor="project-name" className="mb-2.5 block text-sm font-medium">Project name</label>
          <input id="project-name" name="name" autoComplete="off" placeholder="e.g. The next big idea" maxLength={100} required aria-describedby="project-name-help" className="auth-input" />
          <p id="project-name-help" className="mt-2 text-xs text-muted">Keep it simple. Up to 100 characters.</p>
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-5">
            <button type="button" onClick={() => dialogRef.current.close()} className="h-11 rounded-lg border border-line px-4 text-sm font-medium transition-colors hover:bg-raised active:bg-line">Cancel</button>
            <button type="submit" disabled aria-describedby="project-create-note" className="primary-button h-11 w-auto"><Icon name="plus" className="h-4 w-4" />Create project</button>
          </div>
          <p id="project-create-note" className="mt-3 text-right text-xs text-muted">Project creation is coming soon.</p>
        </form>
      </div>
    </dialog>
  )
}

export default function Home() {
  const { user, error, signOut } = useUser()
  const [busy, setBusy] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const dialogRef = useRef(null)
  const initial = (user?.email?.[0] || 'P').toUpperCase()

  useEffect(() => { document.title = 'Your workspace · PatchWork AI' }, [])

  function openNewProject() {
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
          <a href="#projects" aria-current="page" className="flex items-center gap-3 rounded-lg bg-accent/10 px-3 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/15 active:bg-accent/20"><Icon name="folder" className="h-[18px] w-[18px]" />Projects<span className="ml-auto text-xs">0</span></a>
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

          <section id="projects" aria-labelledby="projects-heading" className="mt-12 scroll-mt-6">
            <div className="mb-5 flex items-center gap-3"><h2 id="projects-heading" className="text-sm font-medium">Your projects</h2><span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-line px-1 text-[10px] text-muted">0</span><span className="ml-1 h-px flex-1 bg-line/70" /></div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-panel/40 px-5 py-12 text-center">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-35 [background-image:radial-gradient(rgb(var(--line))_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden="true" />
                <div className="relative"><ProjectArtwork /></div>
                <h3 className="mt-7 text-xl font-medium tracking-tight">A blank canvas. A fresh start.</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted">Every great idea starts somewhere. Create a project and give yours a place to grow.</p>
                <button type="button" onClick={openNewProject} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-raised/60 px-4 text-xs font-medium transition-colors hover:border-accent/50 hover:bg-raised active:bg-line"><Icon name="plus" className="h-4 w-4" />Create your first project<Icon name="arrow" className="ml-1 h-3.5 w-3.5 text-muted" /></button>
              </div>

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

      <NewProjectDialog dialogRef={dialogRef} />
    </div>
  )
}
