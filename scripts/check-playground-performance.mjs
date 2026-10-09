// Run after build:playground. Guard the dependency boundaries that keep a simple
// form or component preview from fetching the whole documentation catalogue.
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = new URL('../playground-dist/', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('.vite/manifest.json', dist), 'utf8'))
function graph(entry) {
  assert(manifest[entry], `Missing build entry: ${entry}`)
  const files = new Set()
  const visit = key => {
    const chunk = manifest[key]
    assert(chunk, `Missing dependency: ${key}`)
    if (files.has(chunk.file)) return
    files.add(chunk.file)
    for (const dependency of chunk.imports ?? []) visit(dependency)
  }
  visit(entry)
  return [...files]
}

const login = graph('playground/blocks/sign-in.tsx')
assert.deepEqual(login.filter(file => /(?:calendar|date-picker|date-range-picker|time-picker|multi-select|CartesianChart|highlight|shiki)/i.test(file)), [], 'Sign-in must not import pickers, charts or syntax highlighters')
const component = graph('playground/pages/component-page.tsx')
assert(!component.includes(manifest['playground/example-code.tsx'].file), 'Raw example sources must load only when opening a code tab')
const frame = graph('playground/block-frame.html')
assert(!frame.includes(manifest['index.html'].file), 'The iframe must not boot the documentation application')

const html = readFileSync(new URL('components/dialog.html', dist), 'utf8')
assert(html.includes('id="preview-default"') && html.includes('rel="modulepreload"'), 'First previews must be prerendered with module preloads')
for (const [name, files] of [['Sign-in', login], ['Component page', component], ['Block frame', frame]]) {
  const bytes = files.reduce((total, file) => total + statSync(fileURLToPath(new URL(file, dist))).size, 0)
  console.log(`${name}: ${files.length} static JS modules, ${(bytes / 1024).toFixed(1)} KiB before compression`)
}
console.log('Playground loading boundaries passed.')
