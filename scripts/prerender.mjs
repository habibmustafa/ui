// Writes a prerendered HTML file for every playground route into playground-dist/, so the
// site paints before its JavaScript loads (main.tsx hydrates it). Run by
// `npm run build:playground` after the client build and the SSR build of
// playground/entry-server.tsx (into playground-ssr/).
//
// File names follow Cloudflare's default `auto-trailing-slash` HTML handling: `/` is
// index.html and `/components/button` is components/button.html. 404.html stays the
// unrendered app shell, so any other path still boots the client router.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'playground-dist')
const { render, ROUTES, criticalModules } = await import(
  pathToFileURL(join(root, 'playground-ssr', 'entry-server.js')).href
)

const ROOT = '<div id="root"></div>'
// A fresh client build leaves the shell in index.html; on a re-run index.html is already
// prerendered and the shell is the 404.html written last time.
let shell = readFileSync(join(dist, 'index.html'), 'utf8')
if (shell.includes(ROOT)) writeFileSync(join(dist, '404.html'), shell)
else shell = readFileSync(join(dist, '404.html'), 'utf8')
if (!shell.includes(ROOT) || !/<title>[^<]*<\/title>/.test(shell)) {
  throw new Error('playground-dist has no app shell (empty #root and a <title>) to fill in')
}

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const manifest = JSON.parse(readFileSync(join(dist, '.vite', 'manifest.json'), 'utf8'))
function preloads(route) {
  const files = new Set()
  const visit = key => {
    const chunk = manifest[key]
    if (!chunk || files.has(chunk.file)) return
    files.add(chunk.file)
    for (const dependency of chunk.imports ?? []) visit(dependency)
  }
  for (const key of criticalModules(route)) visit(key)
  return [...files].filter(file => !shell.includes(`href="/${file}"`)).map(file => `<link rel="modulepreload" crossorigin href="/${file}">`).join('')
}

const started = Date.now()
for (const route of ROUTES) {
  const { html, title } = await render(route)
  const page = shell
    .replace('</head>', () => `${preloads(route)}</head>`)
    .replace(ROOT, () => `<div id="root">${html}</div>`)
    .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
  const file = join(dist, route === '/' ? 'index.html' : `${route.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, page)
}
console.log(`Prerendered ${ROUTES.length} routes in ${Date.now() - started}ms`)
