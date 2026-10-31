import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { createRequire } from 'node:module'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { act, createElement, StrictMode } from 'react'
import { createServer } from 'vite'

test('project creation through the frontend and Express API', async (t) => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost:5173' })
  for (const key of ['window', 'document', 'localStorage', 'HTMLElement', 'HTMLInputElement', 'Event', 'FormData']) {
    globalThis[key] = dom.window[key]
  }
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  // jsdom does not implement native dialogs. Test our handlers, not browser focus trapping.
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true }
  dom.window.HTMLDialogElement.prototype.close = function () {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }

  const backendRequire = createRequire(new URL('../../Backend/package.json', import.meta.url))
  const dependency = (name) => import(pathToFileURL(backendRequire.resolve(name)).href)
  const { default: express } = await dependency('express')
  const { default: jwt } = await dependency('jsonwebtoken')
  const { default: mongoose } = await dependency('mongoose')
  const { createRoot } = await import('react-dom/client')
  const ownerId = String(new mongoose.Types.ObjectId())
  const originalSecret = process.env.JWT_SECRET
  process.env.JWT_SECRET = 'frontend-project-tests-only'
  const token = jwt.sign({ id: ownerId, email: 'creator@example.com' }, process.env.JWT_SECRET)
  const records = new Map()
  const requests = []
  let mode = 'success'
  let releaseCreation
  let root
  let context

  mock.module(new URL('../../Backend/src/services/redis.service.js', import.meta.url).href, {
    defaultExport: { get: async () => null, set: async () => 'OK' },
  })
  const { default: router } = await import('../../Backend/src/routes/project.routes.js')
  const { authUserMiddleware } = await import('../../Backend/src/middleware/auth.middleware.js')
  const { default: projectModel } = await import('../../Backend/src/models/project.model.js')
  const { default: userModel } = await import('../../Backend/src/models/user.model.js')
  mock.method(console, 'error', () => {})
  mock.method(userModel, 'findById', (id) => ({ select: async () => id === ownerId ? { _id: ownerId } : null }))
  mock.method(projectModel, 'create', async (data) => {
    if (mode === 'server-error') throw new Error('Private database details')
    if (mode === 'validation') throw new mongoose.Error.ValidationError()
    if (mode === 'malformed') return { name: data.name }
    if (mode === 'pending') await new Promise((resolve) => { releaseCreation = resolve })
    const project = new projectModel(data)
    await project.validate()
    if (records.has(project.name)) throw Object.assign(new Error('Duplicate'), { code: 11000 })
    records.set(project.name, project)
    return project
  })

  const app = express()
  app.use(express.json())
  app.get('/users/profile', authUserMiddleware, (req, res) => res.json({ user: req.user }))
  app.use('/projects', (req, res, next) => {
    requests.push({ body: req.body, authorization: req.headers.authorization })
    next()
  }, router)
  const httpServer = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => httpServer.once('listening', resolve))
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  t.after(async () => {
    if (root) await act(async () => root.unmount())
    await vite.close()
    httpServer.closeAllConnections()
    await new Promise((resolve) => httpServer.close(resolve))
    mock.restoreAll()
    if (originalSecret === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = originalSecret
    dom.window.close()
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  })

  const { UserProvider } = await vite.ssrLoadModule('/src/context/user.context.jsx')
  const { useUser } = await vite.ssrLoadModule('/src/context/useUser.js')
  const { default: AppRoutes } = await vite.ssrLoadModule('/src/routes/AppRoutes.jsx')
  const { default: api } = await vite.ssrLoadModule('/src/config/axios.js')
  const { AxiosError } = await import('axios')
  api.defaults.baseURL = `http://127.0.0.1:${httpServer.address().port}`
  api.defaults.adapter = 'http'
  function Probe() { context = useUser(); return null }
  const text = () => document.body.textContent
  const dialog = () => document.querySelector('dialog')
  const form = () => dialog().querySelector('form')
  const input = () => document.getElementById('project-name')
  const submitButton = () => form().querySelector('button[type="submit"]')
  async function waitFor(check) {
    for (let i = 0; i < 100; i++) {
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)) })
      if (check()) return
    }
    assert.fail('Timed out waiting for UI update')
  }
  async function mount(authenticated = true) {
    if (root) await act(async () => root.unmount())
    window.history.replaceState({}, '', '/')
    localStorage.clear()
    if (authenticated) localStorage.setItem('token', token)
    mode = 'success'
    api.defaults.adapter = 'http'
    root = createRoot(document.getElementById('root'))
    await act(async () => root.render(createElement(StrictMode, null,
      createElement(UserProvider, null, createElement(AppRoutes), createElement(Probe)))))
    await waitFor(() => document.querySelector('h1'))
  }
  async function open() {
    await act(async () => [...document.querySelectorAll('button')].find((button) => button.textContent === 'New project').click())
  }
  async function fill(name) {
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input(), name)
      input().dispatchEvent(new Event('input', { bubbles: true }))
    })
  }
  async function submit() {
    await act(async () => form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  }

  await t.test('guests are sent to sign in before creating a project', async () => {
    await mount(false)
    await open()
    assert.equal(window.location.pathname, '/login')
    assert.equal(requests.length, 0)
  })

  await t.test('blank and overlong names are rejected without an API request', async () => {
    await mount()
    await open()
    const before = requests.length
    for (const name of ['   ', 'a'.repeat(101)]) {
      await fill(name)
      await submit()
      assert.equal(input().getAttribute('aria-invalid'), 'true')
      assert.equal(document.activeElement, input())
    }
    assert.equal(requests.length, before)
  })

  await t.test('Axios sends the trimmed name and bearer token; a saved project updates the UI', async () => {
    await fill('  Release Planning  ')
    await submit()
    await waitFor(() => !dialog().open)
    assert.deepEqual(requests.at(-1).body, { name: 'Release Planning' })
    assert.equal(requests.at(-1).authorization, `Bearer ${token}`)
    assert.ok(records.has('release planning'))
    assert.match(text(), /Project “release planning” created/)
    assert.equal(document.querySelector('ul h3').textContent, 'release planning')
    assert.equal(document.querySelector('a[href="#projects"] span').textContent, '1')
    await open()
    assert.equal(input().value, '')
  })

  await t.test('duplicate-name responses preserve input and focus the field', async () => {
    await fill('Release Planning')
    await submit()
    await waitFor(() => input().getAttribute('aria-invalid') === 'true')
    assert.match(text(), /already exists/)
    assert.equal(input().value, 'Release Planning')
    assert.equal(document.activeElement, input())
    assert.equal(dialog().open, true)
  })

  await t.test('backend validation failures are displayed inline', async () => {
    mode = 'validation'
    await fill('validation test')
    await submit()
    await waitFor(() => input().getAttribute('aria-invalid') === 'true')
    assert.match(text(), /Check your project name/)
  })

  await t.test('server failures preserve the form and do not expose internal details', async () => {
    mode = 'server-error'
    await fill('server test')
    await submit()
    await waitFor(() => !submitButton().disabled)
    assert.match(text(), /Could not create project/)
    assert.doesNotMatch(text(), /Private database details/)
    assert.equal(input().value, 'server test')
  })

  await t.test('a pending request blocks duplicate submit, Cancel, and Escape', async () => {
    mode = 'pending'
    releaseCreation = null
    await fill('one request only')
    const before = requests.length
    await submit()
    await waitFor(() => releaseCreation)
    assert.equal(submitButton().disabled, true)
    assert.equal([...form().querySelectorAll('button')].find((button) => button.textContent === 'Cancel').disabled, true)
    const cancel = new Event('cancel', { cancelable: true })
    dialog().dispatchEvent(cancel)
    assert.equal(cancel.defaultPrevented, true)
    await submit()
    assert.equal(requests.length, before + 1)
    await act(async () => releaseCreation())
    await waitFor(() => !dialog().open)
    assert.equal(document.querySelectorAll('ul li').length, 2)
  })

  await t.test('network failures explain uncertain completion without clearing the name', async () => {
    await open()
    api.defaults.adapter = async (config) => { throw new AxiosError('Network Error', 'ERR_NETWORK', config) }
    await fill('network test')
    await submit()
    await waitFor(() => !submitButton().disabled)
    assert.match(text(), /may have been saved/)
    assert.equal(input().value, 'network test')
    api.defaults.adapter = 'http'
  })

  await t.test('malformed success responses never display a false success', async () => {
    mode = 'malformed'
    await fill('malformed test')
    await submit()
    await waitFor(() => !submitButton().disabled)
    assert.match(text(), /Creation could not be confirmed/)
    assert.equal(document.querySelectorAll('ul li').length, 2)
    assert.equal(dialog().open, true)
  })

  await t.test('an expired token clears authentication and hides the previous user’s projects', async () => {
    mode = 'success'
    localStorage.setItem('token', jwt.sign({ id: ownerId, exp: 1 }, process.env.JWT_SECRET))
    await fill('expired session')
    await submit()
    await waitFor(() => context.user === null)
    assert.equal(localStorage.getItem('token'), null)
    assert.equal(document.querySelector('ul'), null)
    assert.match(text(), /Sign in to create this project/)
    assert.equal(submitButton().disabled, true)
    await act(async () => dialog().querySelector('a[href="/login"]').click())
    assert.equal(window.location.pathname, '/login')
  })
})
