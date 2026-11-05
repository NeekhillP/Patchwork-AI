import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProjectChat from '../components/ProjectChat'
import axios from '../config/axios'
import { useUser } from '../context/useUser'

export default function Project() {
  const { projectId } = useParams()
  const { user } = useUser()
  return <ProjectWorkspace key={`${user.id}:${projectId}`} projectId={projectId} />
}

function ProjectWorkspace({ projectId }) {
  const { clearSession } = useUser()
  const [project, setProject] = useState(null)
  const [failure, setFailure] = useState(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    axios.get(`/projects/${encodeURIComponent(projectId)}`, { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return
        if (data.project?._id !== projectId || typeof data.project.name !== 'string' || !Array.isArray(data.project.users) || data.project.users.some((member) => !member?._id || typeof member.email !== 'string')) throw new Error('Invalid project response')
        setProject(data.project)
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        if (error.response?.status === 401) clearSession('Your session has expired. Please sign in again.')
        else setFailure({ status: error.response?.status, message: [400, 403, 404].includes(error.response?.status)
          ? 'This project is unavailable or you don’t have access.'
          : 'Couldn’t load this project. Please try again.' })
      })
    return () => controller.abort()
  }, [projectId, revision, clearSession])

  useEffect(() => { document.title = `${project?.name || 'Project'} · PatchWork AI` }, [project?.name])

  function handleAccessLost() {
    setProject(null)
    setFailure({ status: 403, message: 'You no longer have access to this project.' })
  }

  return (
    <main className="flex h-dvh min-h-0 bg-canvas">
      {project ? <ProjectChat project={project} onProjectChange={setProject} onAccessLost={handleAccessLost} />
        : <section className="flex h-full w-full flex-col border-r border-line bg-panel sm:w-[360px] lg:w-[390px]">
          <Link to="/" className="text-link m-6 w-fit text-sm">Back to projects</Link>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            {failure ? <div role="alert"><h1 className="text-lg font-medium">Project unavailable</h1><p className="mt-3 text-sm leading-6 text-muted">{failure.message}</p>{![400, 403, 404].includes(failure.status) && <button type="button" onClick={() => { setFailure(null); setRevision((value) => value + 1) }} className="text-link mt-4 min-h-10 text-sm">Try again</button>}</div>
              : <p role="status" className="text-sm text-muted">Loading project…</p>}
          </div>
        </section>}
      <div aria-hidden="true" className="hidden min-w-0 flex-1 sm:block" />
    </main>
  )
}
