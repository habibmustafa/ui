/*
 * Generates playground/generated/api.ts — the props tables shown in each component
 * page's "API" section — straight from the library's TypeScript types, so the docs
 * can't drift from the code.
 *
 * One entry per component directory (its name is the playground registry id), with
 * every component exported from that directory's index.ts. Only props declared in
 * this repo are listed; props inherited from React/Radix/etc. are summarised as
 * "extends" sources instead of dumping hundreds of DOM attributes.
 *
 *   npm run api:generate          rewrite the file
 *   npm run api:generate -- --check   fail if the committed file is stale (CI)
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import docgen from 'react-docgen-typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'playground/generated/api.ts')
const check = process.argv.includes('--check')

const isExternal = (fileName) => fileName.includes(`${sep}node_modules${sep}`) || fileName.includes('/node_modules/')

// react-docgen-typescript caches prop docs by "<declaring file>_<prop name>", so two
// Radix parts declared in the same .d.ts (Tabs.Root's and Tabs.Content's `value`)
// share one entry and the second component reports the first one's prop. Clear the
// cache per component instead.
const getPropsInfo = docgen.Parser.prototype.getPropsInfo
docgen.Parser.prototype.getPropsInfo = function (...args) {
  this.propertiesOfPropsCache.clear()
  return getPropsInfo.apply(this, args)
}

const parser = docgen.withCustomConfig(join(root, 'tsconfig.app.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  shouldSortUnions: true,
  // A prop is "ours" if any of its declarations lives in this repo — e.g. Tabs'
  // `value` is redeclared by the props mode even though Radix also declares it.
  propFilter: (prop) => {
    const decls = prop.declarations ?? (prop.parent ? [prop.parent] : [])
    return decls.length === 0 || decls.some((d) => !isExternal(d.fileName))
  },
})

/** Component directories = every folder under src/components that has an index.ts. */
function componentDirs(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const full = join(dir, entry.name)
    if (existsSync(join(full, 'index.ts'))) found.push(full)
    else found.push(...componentDirs(full))
  }
  return found
}

function packageOf(fileName) {
  const parts = fileName.split(/[\\/]/)
  const i = parts.lastIndexOf('node_modules')
  if (i === -1) return null
  const name = parts[i + 1]
  const pkg = name.startsWith('@') ? `${name}/${parts[i + 2]}` : name
  // @types/react -> react
  return pkg.startsWith('@types/') ? pkg.slice('@types/'.length) : pkg
}

function formatType(type) {
  if (type.name === 'enum' && Array.isArray(type.value)) {
    // TypeScript can intern the same union in a different order as new examples use it.
    // Keep the displayed options stable even when docgen's cached enum is unsorted.
    return type.value.map((v) => v.value).sort((a, b) => String(a).localeCompare(String(b), 'en')).join(' | ')
  }
  return type.raw && type.raw.length < type.name.length ? type.raw : type.name
}

// React's base interfaces show up under every DOM-backed component and say nothing
// useful; Radix's *ImplProps are internal layers of a public props type already listed.
const NOISE = new Set(['Attributes', 'RefAttributes', 'AriaAttributes', 'DOMAttributes'])

/** Inherited-prop sources, e.g. `ButtonHTMLAttributes` from `react`, collapsed to unique names. */
function extendsOf(allProps) {
  const sources = new Map()
  for (const prop of Object.values(allProps)) {
    for (const decl of prop.declarations ?? (prop.parent ? [prop.parent] : [])) {
      if (!isExternal(decl.fileName)) continue
      const name = decl.name?.replace(/\$\d+$/, '')
      if (!name || name === 'TypeLiteral' || name === '__type') continue
      if (NOISE.has(name) || name.endsWith('ImplProps')) continue
      const pkg = packageOf(decl.fileName)
      sources.set(`${name}|${pkg}`, { name, package: pkg })
    }
  }
  const list = [...sources.values()]
  // A specific element's attributes (ButtonHTMLAttributes, …) already include HTMLAttributes.
  const hasSpecific = list.some((s) => s.package === 'react' && /.+HTMLAttributes$/.test(s.name))
  return list
    .filter((s) => !(hasSpecific && s.package === 'react' && s.name === 'HTMLAttributes'))
    .sort((a, b) => (a.package + a.name < b.package + b.name ? -1 : 1))
}

// A second, unfiltered parser to learn what each component inherits.
const fullParser = docgen.withCustomConfig(join(root, 'tsconfig.app.json'), {
  savePropValueAsString: true,
  shouldRemoveUndefinedFromOptional: true,
})

// docgen reports forward-slash paths; join() uses backslashes on Windows.
const posix = (p) => p.split(sep).join('/')

const dirs = componentDirs(join(root, 'src/components')).sort()
const indexFiles = dirs.map((d) => join(d, 'index.ts'))
const docs = parser.parse(indexFiles)
const fullDocs = fullParser.parse(indexFiles)
const fullByKey = new Map(fullDocs.map((d) => [`${posix(d.filePath)}#${d.displayName}`, d]))

/**
 * `export const Tabs = Object.assign(TabsHybrid, { Root: TabsRoot, … })` → TabsRoot is
 * documented as `Tabs.Root`, the spelling the compound examples use.
 */
function namespaceAliases(indexFile) {
  const aliases = new Map()
  const source = readFileSync(indexFile, 'utf8')
  for (const match of source.matchAll(/export const (\w+) = Object\.assign\(\s*\w+\s*,\s*\{([^}]*)\}/g)) {
    const [, namespace, body] = match
    for (const pair of body.matchAll(/(\w+)\s*:\s*(\w+)/g)) {
      if (!aliases.has(pair[2])) aliases.set(pair[2], `${namespace}.${pair[1]}`)
    }
  }
  return aliases
}

const api = {}
for (const dir of dirs) {
  const id = dir.split(/[\\/]/).pop()
  const indexFile = join(dir, 'index.ts')
  const aliases = namespaceAliases(indexFile)
  const components = docs
    .filter((d) => posix(d.filePath) === posix(indexFile))
    .map((d) => {
      const full = fullByKey.get(`${posix(d.filePath)}#${d.displayName}`)
      return {
        name: d.displayName,
        alias: aliases.get(d.displayName),
        description: d.description || undefined,
        props: Object.values(d.props)
          .map((p) => ({
            name: p.name,
            type: formatType(p.type),
            required: p.required || undefined,
            default: p.defaultValue?.value != null ? String(p.defaultValue.value) : undefined,
            description: p.description || undefined,
          })),
        extends: full ? extendsOf(full.props) : [],
      }
    })
  if (components.length > 0) {
    api[id] = { source: relative(root, dir).split(sep).join('/'), components }
  }
}

const header = `/* eslint-disable */
// Generated by scripts/generate-api.mjs from the library's TypeScript types.
// Do not edit by hand — run \`npm run api:generate\`.
`
const body = `${header}
export interface ApiProp {
  name: string
  type: string
  required?: boolean
  default?: string
  description?: string
}

export interface ApiComponent {
  name: string
  /** Namespace spelling for compound parts, e.g. \`Tabs.Root\` for \`TabsRoot\`. */
  alias?: string
  description?: string
  props: ApiProp[]
  /** Types this component also accepts every prop of (React DOM attributes, Radix parts, …). */
  extends: { name: string; package: string | null }[]
}

export const api: Record<string, { source: string; components: ApiComponent[] }> = ${JSON.stringify(api, null, 2)}
`

if (check) {
  const current = existsSync(outFile) ? readFileSync(outFile, 'utf8') : ''
  if (current !== body) {
    console.error('playground/generated/api.ts is out of date — run `npm run api:generate` and commit the result.')
    process.exit(1)
  }
  console.log(`API docs up to date (${Object.keys(api).length} components).`)
} else {
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, body)
  console.log(`Wrote ${relative(root, outFile)} (${Object.keys(api).length} components).`)
}
