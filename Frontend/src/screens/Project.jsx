import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import ProjectChat from '../components/ProjectChat'

export default function Project() {
  const { projectId } = useParams()
  const { state } = useLocation()
  const projectName = state?.projectId === projectId && typeof state.projectName === 'string' ? state.projectName : 'Project'
  useEffect(() => { document.title = `${projectName} · PatchWork AI` }, [projectName])

  return (
    <main className="flex h-dvh min-h-0 bg-canvas">
      <ProjectChat key={projectId} projectName={projectName} />
      <div aria-hidden="true" className="hidden min-w-0 flex-1 sm:block" />
    </main>
  )
}
