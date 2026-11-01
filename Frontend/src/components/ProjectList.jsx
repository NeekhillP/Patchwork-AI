import { Link } from 'react-router-dom'
import Icon from './WorkspaceIcon'

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

export default function ProjectList({ projects, loading, error, signedIn, onRetry, onCreate }) {
  return (
    <div aria-busy={loading} className="min-w-0">
      {error && <div role="alert" className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
        <p>{error}{projects.length > 0 && ' Previously loaded projects are shown below.'}</p>
        <button type="button" onClick={onRetry} className="text-link mt-2 min-h-9 text-xs">Try again</button>
      </div>}

      {projects.length > 0 ? <>
        <p role="status" className="sr-only">{loading ? 'Refreshing projects…' : `${projects.length} projects loaded.`}</p>
        <ul aria-label="Your projects" className="grid content-start gap-4 sm:grid-cols-2">
          {projects.map((project) => <li key={project._id} className="min-w-0">
            <Link to={`/projects/${project._id}`} state={{ projectId: project._id, projectName: project.name }} aria-label={`Open project ${project.name}`} className="block h-full rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-accent/50 hover:bg-raised/50 active:bg-raised">
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon name="folder" /></span>
                {project.users.length > 1 && <span className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted">Shared</span>}
              </div>
              <h3 className="break-words text-lg font-medium tracking-tight">{project.name}</h3>
              <p className="mt-4 flex items-center gap-2 border-t border-line/70 pt-4 text-xs text-muted"><Icon name="people" className="h-3.5 w-3.5" />{project.users.length} {project.users.length === 1 ? 'member' : 'members'}</p>
            </Link>
          </li>)}
        </ul>
      </> : <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-panel/40 px-5 py-12 text-center">
        {loading ? <div role="status" className="flex flex-col items-center gap-4 text-sm text-muted"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" aria-hidden="true" />Loading your projects…</div>
          : error ? <><Icon name="folder" className="h-10 w-10 text-muted" /><h3 className="mt-5 text-lg font-medium">Your workspace is still here.</h3><p className="mt-2 text-sm text-muted">Try again to load your projects.</p></>
            : <>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-35 [background-image:radial-gradient(rgb(var(--line))_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden="true" />
              <div className="relative"><ProjectArtwork /></div>
              <h3 className="mt-7 text-xl font-medium tracking-tight">{signedIn ? 'A blank canvas. A fresh start.' : 'Your projects start here.'}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{signedIn ? 'Start your first project, or ask a teammate to add you to theirs.' : 'Sign in to see your projects and the spaces you share with others.'}</p>
              <button type="button" onClick={onCreate} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-raised/60 px-4 text-xs font-medium transition-colors hover:border-accent/50 hover:bg-raised active:bg-line"><Icon name="plus" className="h-4 w-4" />{signedIn ? 'Create your first project' : 'Sign in to your workspace'}<Icon name="arrow" className="ml-1 h-3.5 w-3.5 text-muted" /></button>
            </>}
      </div>}
    </div>
  )
}
