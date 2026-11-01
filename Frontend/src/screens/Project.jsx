import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function Project() {
  const { projectId } = useParams()
  useEffect(() => { document.title = 'Project · PatchWork AI' }, [])

  return <div>Project: {projectId}</div>
}
