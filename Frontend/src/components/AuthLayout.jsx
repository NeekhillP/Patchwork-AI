import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function PatchMark({ className = 'h-8 w-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M2 2h12v12H2zM18 2h12v12H18zM2 18h12v12H2z" />
      <path d="M18 18h12v12H18z" transform="rotate(12 24 24)" />
    </svg>
  )
}

function ConversationPreview() {
  return (
    <div className="mt-10 select-none" aria-hidden="true">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        <span className="h-1 w-1 rounded-full bg-accent" /> A glimpse of your workspace
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2 xl:grid-cols-[116px_1fr]">
        <div className="flex items-center justify-center rounded-tl-[32px] rounded-br-[32px] bg-accent py-5 text-canvas">
          <svg className="h-16 w-16" viewBox="0 0 80 80" fill="none">
            <path d="M40 4v72M4 40h72M14.5 14.5l51 51m0-51-51 51" stroke="currentColor" strokeWidth="12" />
            <circle cx="40" cy="40" r="11" fill="rgb(var(--accent))" />
          </svg>
        </div>
        <div className="flex flex-col justify-center rounded-tr-[32px] bg-paper px-6 py-5 text-canvas">
          <div className="mb-3 flex -space-x-2 text-[10px] font-semibold">
            {['JL', 'AK', 'YOU'].map((name) => <span key={name} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-paper bg-accent">{name}</span>)}
          </div>
          <p className="text-[17px] font-medium leading-snug tracking-tight">Different minds.<br />Shared momentum.</p>
        </div>
        <div className="col-span-2 rounded-b-xl border border-line bg-panel p-5">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-3 text-xs">
            <span className="font-medium text-ink"><span className="mr-2 text-muted">#</span> the-next-big-idea</span>
            <span className="rounded bg-raised px-2 py-1 text-[10px] text-muted">Shared conversation</span>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-paper text-[10px] font-semibold text-canvas">JL</span>
            <div className="text-xs leading-relaxed"><span className="font-medium">Jamie</span><p className="mt-1 text-muted">What if we built on this idea together?</p></div>
          </div>
          <div className="mt-4 flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent"><PatchMark className="h-4 w-4" /></span>
            <div className="text-xs leading-relaxed"><span className="font-medium text-accent">PatchWork AI</span><p className="mt-1 max-w-[290px] text-muted">Let’s connect the dots. Here’s a starting point for your team to explore.</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthLayout({ title, children }) {
  useEffect(() => { document.title = `${title} · PatchWork AI` }, [title])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="flex flex-col border-b border-line px-6 py-6 sm:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-10 xl:px-16">
        <Link to="/" className="flex w-fit items-center gap-3 rounded-sm text-lg font-semibold tracking-tight transition-colors hover:text-accent active:text-paper" aria-label="PatchWork AI home">
          <PatchMark className="h-7 w-7 text-accent" />
          <span>PatchWork <span className="font-normal text-muted">AI</span></span>
        </Link>
        <div className="mx-auto hidden w-full max-w-[460px] flex-1 flex-col justify-center py-12 lg:flex">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-muted">A shared space for what’s next</p>
          <h2 className="text-[clamp(2.75rem,4vw,3.75rem)] font-medium leading-[1.08] tracking-[-0.055em]">Good ideas come<br /><span className="font-editorial font-normal italic tracking-[-0.045em] text-accent">together.</span></h2>
          <p className="mt-5 max-w-[340px] text-sm leading-7 text-muted">Your people, your conversations, and a little AI.<br />All woven into one workspace.</p>
          <ConversationPreview />
        </div>
        <p className="hidden text-[11px] tracking-wide text-muted lg:block">Made for the way we think together.</p>
      </aside>
      <main id="main" className="flex min-w-0 flex-col bg-panel px-6 py-8 sm:px-12 lg:px-10 lg:py-10">
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-8 sm:py-16 lg:py-12">{children}</div>
        <p className="mt-8 text-center text-[11px] text-muted">A little structure. A lot of possibility.</p>
      </main>
    </div>
  )
}
