const paths = {
  plus: 'M12 5v14M5 12h14',
  folder: 'M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z',
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a8.5 8.5 0 0 1 17 0ZM7 10h7M7 14h4',
  people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  arrow: 'M7 17 17 7M7 7h10v10',
  logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14 8l4 4-4 4M8 12h12',
  close: 'm6 6 12 12M6 18 18 6',
}

export default function WorkspaceIcon({ name, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  )
}
