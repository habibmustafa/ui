/*
 * Copies package.json's version into package-lock.json (the root `version` and the
 * `packages[""].version` entry). Run by `npm run version-packages` right after
 * `changeset version` bumps package.json.
 *
 * This replaces `npm install --package-lock-only`: that command re-resolves every
 * dependency, and with `npm@latest` (which the publish workflow installs for Trusted
 * Publishing) it fails with EALLOWREMOTE on the optional @tailwindcss/oxide-wasm32-wasi
 * tarball. Only the version needs to change, so no network is needed.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
const raw = readFileSync('package-lock.json', 'utf8')
const lock = JSON.parse(raw)

lock.version = version
if (lock.packages?.['']) lock.packages[''].version = version

const indent = /^\{\n( +)"/.exec(raw)?.[1].length ?? 2
const trailingNewline = raw.endsWith('\n') ? '\n' : ''
const next = JSON.stringify(lock, null, indent) + trailingNewline

if (next !== raw) {
  writeFileSync('package-lock.json', next)
  console.log(`package-lock.json -> ${version}`)
} else {
  console.log(`package-lock.json already at ${version}`)
}
