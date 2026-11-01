import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/useUser'
import Icon from './WorkspaceIcon'

const previewMembers = [
  { id: 'preview-maya', name: 'Maya Chen', email: 'maya@example.com', initials: 'MC' },
  { id: 'preview-alex', name: 'Alex Rivera', email: 'alex@example.com', initials: 'AR' },
]
const previewMessages = [
  { id: 'intro', own: false, text: 'Hey team! Let’s keep our ideas and project updates in this thread.' },
  { id: 'reply', own: true, text: 'Sounds good. One place for everything we’re working on.' },
]

export default function ProjectChat({ projectName }) {
  const { user } = useUser()
  const [membersOpen, setMembersOpen] = useState(false)
  const [messages, setMessages] = useState(previewMessages)
  const [draft, setDraft] = useState('')
  const memberButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const conversationRef = useRef(null)
  const inputRef = useRef(null)
  const members = [{ id: user.id, name: 'You', email: user.email, initials: user.email[0].toUpperCase() }, ...previewMembers]

  useEffect(() => {
    if (membersOpen) closeButtonRef.current?.focus()
  }, [membersOpen])

  useEffect(() => {
    const conversation = conversationRef.current
    if (conversation) conversation.scrollTop = conversation.scrollHeight
  }, [messages, membersOpen])

  function closeMembers() {
    setMembersOpen(false)
    memberButtonRef.current?.focus()
  }

  function sendMessage(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), own: true, text }])
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <section aria-label={`${projectName} conversation`} onKeyDown={(event) => { if (event.key === 'Escape' && membersOpen) closeMembers() }} className="flex h-full min-h-0 w-full flex-col border-r border-line bg-panel sm:w-[360px] sm:shrink-0 lg:w-[390px]">
      <header className="flex min-h-[84px] shrink-0 items-center gap-3 border-b border-line px-4 py-4">
        <Link to="/" aria-label="Back to projects" title="Back to projects" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line"><Icon name="back" className="h-[18px] w-[18px]" /></Link>
        <div className="min-w-0 flex-1"><p className="mb-1 text-[9px] font-medium uppercase tracking-[0.16em] text-muted">Project workspace</p><h1 title={projectName} className="truncate text-sm font-semibold tracking-tight">{projectName}</h1></div>
        <button ref={memberButtonRef} type="button" onClick={() => membersOpen ? closeMembers() : setMembersOpen(true)} aria-label="Project members" aria-expanded={membersOpen} aria-controls={membersOpen ? 'project-members' : undefined} title="Project members" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors active:bg-line ${membersOpen ? 'border-accent/30 bg-accent/10 text-accent' : 'border-line text-muted hover:bg-raised hover:text-ink'}`}><Icon name="people" className="h-[18px] w-[18px]" /></button>
      </header>

      {membersOpen ? <aside id="project-members" aria-labelledby="project-members-title" className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-start justify-between border-b border-line px-6 py-5">
          <div><h2 id="project-members-title" className="text-base font-medium tracking-tight">Project members <span className="ml-1 text-xs text-muted">{members.length}</span></h2><p className="mt-1.5 text-xs text-muted">Sample members for this preview.</p></div>
          <button ref={closeButtonRef} type="button" onClick={closeMembers} aria-label="Close members" className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink active:bg-line"><Icon name="close" className="h-[18px] w-[18px]" /></button>
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {members.map((member, index) => <li key={member.id} className="flex items-center gap-3 rounded-xl border border-line/70 bg-canvas/40 px-3.5 py-4">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? 'bg-accent/15 text-accent' : 'bg-raised text-ink'}`}>{member.initials}</span>
            <div className="min-w-0 flex-1"><p className="text-sm font-medium">{member.name}</p><p className="mt-1 truncate text-xs text-muted" title={member.email}>{member.email}</p></div>
            <span className="text-[10px] text-muted">Member</span>
          </li>)}
        </ul>
        <p className="shrink-0 border-t border-line px-6 py-4 text-[11px] text-muted">A shared space starts with your people.</p>
      </aside> : <>
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-5"><h2 className="flex items-center gap-2 text-xs font-medium"><Icon name="chat" className="h-3.5 w-3.5 text-muted" />Conversation</h2><span className="rounded-full border border-line px-2 py-0.5 text-[9px] tracking-wide text-muted">Preview</span></div>

        <div ref={conversationRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <div className="mb-8 mt-3 text-center"><span className="text-[10px] text-muted">The start of something good.</span><p className="mt-1 text-[10px] text-muted/70">Share a thought. Build on an idea.</p></div>
          <ol aria-label="Conversation preview" aria-live="polite" aria-relevant="additions" className="space-y-6">
            {messages.map((message) => <li key={message.id} className={`flex gap-2.5 ${message.own ? 'justify-end' : 'justify-start'}`}>
              {!message.own && <span className="mt-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-raised text-[9px] font-medium text-accent">MC</span>}
              <div className="min-w-0 max-w-[83%]">
                <p className={`mb-1.5 text-[10px] font-medium text-muted ${message.own ? 'text-right' : ''}`}>{message.own ? 'You' : 'Maya Chen'}</p>
                <p className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-[13px] leading-[1.7] ${message.own ? 'rounded-tr-md border border-accent/20 bg-accent/10 text-ink' : 'rounded-tl-md border border-line bg-raised/60 text-ink'}`}>{message.text}</p>
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
