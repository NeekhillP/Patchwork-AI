import { useEffect, useRef, useState } from 'react'
import axios from '../config/axios'

export default function useProjects(userId, clearSession) {
  const [state, setState] = useState({ ownerId: null, items: [], status: 'loading', error: '', message: '' })
  const [revision, setRevision] = useState(0)
  const activeRequest = useRef(null)
  const current = Boolean(userId) && state.ownerId === userId
  const projects = current ? state.items : []
  const loading = Boolean(userId) && (!current || state.status === 'loading')

  useEffect(() => {
    if (!userId) return
    const request = { ownerId: userId, controller: new AbortController(), created: new Map() }
    activeRequest.current = request

    axios.get('/projects/all', { signal: request.controller.signal })
      .then(({ data }) => {
        if (request.controller.signal.aborted) return
        if (!Array.isArray(data.projects) || data.projects.some((project) =>
          !project?._id || typeof project.name !== 'string' || !Array.isArray(project.users))) {
          throw new Error('Invalid project list response')
        }
        // Include creations confirmed while this request was in flight.
        const items = [...new Map([...request.created.values(), ...data.projects].map((project) => [project._id, project])).values()]
        setState((previous) => ({
          ownerId: userId, items, status: 'ready', error: '',
          message: previous.ownerId === userId ? previous.message : '',
        }))
      })
      .catch((error) => {
        if (request.controller.signal.aborted) return
        if (error.response?.status === 401) {
          clearSession('Your session has expired. Please sign in again.')
          return
        }
        setState((previous) => ({
          ownerId: userId,
          items: previous.ownerId === userId && error.response?.status !== 403 ? previous.items : [],
          status: 'error',
          error: error.response?.status === 403
            ? 'You don’t have permission to view these projects.'
            : 'Couldn’t load your projects. Please try again.',
          message: previous.ownerId === userId ? previous.message : '',
        }))
      })

    return () => request.controller.abort()
  }, [userId, revision, clearSession])

  function refresh() {
    if (!userId || loading) return
    setState((previous) => ({ ...previous, ownerId: userId, items: projects, status: 'loading', error: '' }))
    setRevision((value) => value + 1)
  }

  function addProject(project) {
    const request = activeRequest.current
    if (request?.ownerId === userId && !request.controller.signal.aborted) request.created.set(project._id, project)
    setState((previous) => ({
      ownerId: userId,
      items: [project, ...(previous.ownerId === userId ? previous.items.filter((item) => item._id !== project._id) : [])],
      status: previous.ownerId === userId ? previous.status : 'loading',
      error: previous.ownerId === userId ? previous.error : '',
      message: `Project “${project.name}” created.`,
    }))
  }

  return { projects, loading, error: current ? state.error : '', notice: current ? state.message : '', refresh, addProject }
}
