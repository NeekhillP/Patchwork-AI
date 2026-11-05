export default function UserIdentity({ person, current = false }) {
  const name = person.name || person.username || person.email.split('@')[0]
  const initials = name.split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent" aria-hidden="true">{initials}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium" title={name}>{name}{current && ' (you)'}</span><span className="mt-1 block truncate text-xs text-muted" title={person.email}>{person.email}</span></span>
    </>
  )
}
