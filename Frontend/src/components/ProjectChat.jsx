import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/useUser'
import Icon from './WorkspaceIcon'
import CollaboratorPanel from './CollaboratorPanel'
import UserIdentity from './UserIdentity'

export default function ProjectChat({ project, onProjectChange, onAccessLost }) {
  const { user } = useUser()
  const [panel, setPanel] = useState(null)
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState('')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const collaboratorButtonRef = useRef(null)
  const memberButtonRef = useRef(null)
  const returnFocusRef = useRef(null)
  const closeButtonRef = useRef(null)
  const conversationRef = useRef(null)
  const inputRef = useRef(null)
  const members = project.users
  const projectName = project.name

  useEffect(() => {
    if (panel === 'members') closeButtonRef.current?.focus()
    else if (!panel && !adding) returnFocusRef.current?.focus()
  }, [panel, adding])

  useEffect(() => {
    const conversation = conversationRef.current
    if (conversation) conversation.scrollTop = conversation.scrollHeight
  }, [messages, panel])

  function closePanel() {
    if (!adding) setPanel(null)
  }

  function togglePanel(next) {
    if (adding) return
    returnFocusRef.current = next === 'members' ? memberButtonRef.current : collaboratorButtonRef.current
    setPanel((previous) => previous === next ? null : next)
  }

  function handleAdded(updatedProject) {
    onProjectChange(updatedProject)
    setNotice('Project collaborators updated.')
    setPanel(null)
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), text }])
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <section aria-label={`${projectName} conversation`} onKeyDown={(event) => { if (event.key === 'Escape' && panel && !event.nativeEvent.isComposing) { event.preventDefault(); closePanel() } }} className="flex h-full min-h-0 w-full flex-col border-r border-line bg-panel sm:w-[360px] sm:shrink-0 lg:w-[390px]">
      <header className="flex min-h-[84px] shrink-0 items-center gap-3 border-b border-line px-4 py-4">
        <Link to="/" aria-label="Back to projects" title="Back to projects" aria-disabled={adding} tabIndex={adding ? -1 : undefined} onClick={(event) => { if (adding) event.preventDefault() }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line aria-disabled:opacity-50"><Icon name="back" className="h-[18px] w-[18px]" /></Link>
        <h1 className="sr-only">{projectName}</h1>
        <button ref={collaboratorButtonRef} type="button" disabled={adding} onClick={() => togglePanel('collaborators')} aria-expanded={panel === 'collaborators'} aria-controls={panel === 'collaborators' ? 'project-collaborators' : undefined} className="flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-2 text-xs font-medium text-accent transition-colors hover:bg-accent/15 active:bg-accent/20 disabled:opacity-50"><Icon name="userPlus" className="h-[18px] w-[18px]" />Add collaborator</button>
        <button ref={memberButtonRef} type="button" disabled={adding} onClick={() => togglePanel('members')} aria-label="Project members" aria-expanded={panel === 'members'} aria-controls={panel === 'members' ? 'project-members' : undefined} title="Project members" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors active:bg-line disabled:opacity-50 ${panel === 'members' ? 'border-accent/30 bg-accent/10 text-accent' : 'border-line text-muted hover:bg-raised hover:text-ink'}`}><Icon name="people" className="h-[18px] w-[18px]" /></button>
      </header>

      {panel === 'collaborators' ? <CollaboratorPanel project={project} onClose={closePanel} onAdded={handleAdded} onBusyChange={setAdding} onAccessLost={onAccessLost} /> : panel === 'members' ? <aside id="project-members" aria-labelledby="project-members-title" className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-start justify-between border-b border-line px-6 py-5">
          <div><h2 id="project-members-title" className="text-base font-medium tracking-tight">Project members <span className="ml-1 text-xs text-muted">{members.length}</span></h2><p className="mt-1.5 text-xs text-muted">The people building this project together.</p></div>
          <button ref={closeButtonRef} type="button" onClick={closePanel} aria-label="Close members" className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line"><Icon name="close" className="h-[18px] w-[18px]" /></button>
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {members.map((member) => <li key={member._id} className="flex items-center gap-3 rounded-xl border border-line/70 bg-canvas/40 px-3.5 py-4">
            <UserIdentity person={member} current={member._id === user.id} />
            <span className="text-[10px] text-muted">Member</span>
          </li>)}
        </ul>
        <p className="shrink-0 border-t border-line px-6 py-4 text-[11px] text-muted">A shared space starts with your people.</p>
      </aside> : <>
        <div className="flex shrink-0 items-center justify-between gap-3 px-6 pb-4 pt-5"><div className="min-w-0"><h2 className="flex items-center gap-2 text-xs font-medium"><Icon name="chat" className="h-3.5 w-3.5 text-muted" />Conversation</h2><p title={projectName} className="mt-1.5 truncate text-[11px] text-muted">{projectName}</p></div><span className="rounded-full border border-line px-2 py-0.5 text-[9px] tracking-wide text-muted">Local preview</span></div>
        <p role="status" className={`shrink-0 px-5 text-xs leading-5 text-accent ${notice ? 'pb-4' : ''}`}>{notice}</p>

        <div ref={conversationRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {!messages.length && <div className="my-10 text-center"><Icon name="chat" className="mx-auto mb-3 h-7 w-7 text-muted/60" /><p className="text-xs text-muted">Start the conversation.</p><p className="mt-1.5 text-[11px] leading-5 text-muted/70">Share a thought. Build on an idea.</p></div>}
          <ol aria-label="Conversation preview" aria-live="polite" aria-relevant="additions" className="space-y-6">
            {messages.map((message) => <li key={message.id} className="flex justify-end">
              <div className="min-w-0 max-w-[83%]">
                <p className="mb-1.5 text-right text-[10px] font-medium text-muted">You</p>
                <p className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-md border border-accent/20 bg-accent/10 px-4 py-3 text-[13px] leading-[1.7] text-ink">{message.text}</p>
              </div>
            </li>)}
          </ol>
        </div>

        <form noValidate onSubmit={sendMessage} className="shrink-0 border-t border-line px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <label htmlFor="project-message" className="sr-only">Message</label>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas p-1.5 transition-colors focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/15">
            <input ref={inputRef} id="project-message" name="message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault() }} aria-describedby="message-preview-note" autoComplete="off" maxLength={2000} placeholder="Write a message…" className="h-10 min-w-0 flex-1 rounded-lg bg-transparent pl-3 text-sm text-ink outline-none placeholder:text-muted/70 focus-visible:outline-none" />
            <button type="submit" disabled={!draft.trim()} aria-label="Send preview message" title="Send message (preview)" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-canvas transition-colors hover:bg-ink active:bg-paper disabled:bg-raised disabled:text-muted/50"><Icon name="send" className="h-[18px] w-[18px]" /></button>
          </div>
          <p id="message-preview-note" className="mt-2.5 text-center text-[11px] leading-4 text-muted">Preview only. Messages aren’t saved or sent to members.</p>
        </form>
      </>}
    </section>
  )
}
