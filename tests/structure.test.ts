// Keeps the component tree consistent (README → "Project structure"):
// - atoms live in atoms/<role>/<component>, fragments in fragments/<component>;
// - atoms never import fragments (dependencies only point from fragments to atoms);
// - every component folder is exported from src/index.ts;
// - the playground lists each component in the group matching its folder.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const ROOT = resolve(__dirname, '..')
const COMPONENTS = join(ROOT, 'src/components')
const ROLES = ['actions', 'data-display', 'feedback', 'forms', 'layout', 'navigation', 'overlay']

const dirs = (path: string) =>
  readdirSync(path).filter((name) => statSync(join(path, name)).isDirectory())

const files = (path: string): string[] =>
  readdirSync(path).flatMap((name) => {
    const full = join(path, name)
    return statSync(full).isDirectory() ? files(full) : /\.tsx?$/.test(name) ? [full] : []
  })

const atomDirs = dirs(join(COMPONENTS, 'atoms')).flatMap((role) =>
  dirs(join(COMPONENTS, 'atoms', role)).map((name) => ({ role, name }))
)
const fragmentDirs = dirs(join(COMPONENTS, 'fragments'))

describe('component structure', () => {
  test('atoms are grouped by role', () => {
    expect(dirs(join(COMPONENTS, 'atoms')).sort()).toEqual(ROLES)
  })

  test('a component name exists only once across atoms and fragments', () => {
    const names = [...atomDirs.map((d) => d.name), ...fragmentDirs]
    expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([])
  })

  test('atoms never import from fragments', () => {
    const offenders: string[] = []
    for (const file of files(join(COMPONENTS, 'atoms'))) {
      const source = readFileSync(file, 'utf8')
      for (const [, spec] of source.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
        const target = resolve(file, '..', spec)
        if (target.startsWith(join(COMPONENTS, 'fragments')))
          offenders.push(`${relative(ROOT, file)} -> ${spec}`)
      }
    }
    expect(offenders).toEqual([])
  })

  test('every component folder is exported from src/index.ts', () => {
    const index = readFileSync(join(ROOT, 'src/index.ts'), 'utf8')
    const paths = [
      ...atomDirs.map((d) => `./components/atoms/${d.role}/${d.name}`),
      ...fragmentDirs.map((name) => `./components/fragments/${name}`),
    ]
    const missing = paths.filter(
      (path) => existsSync(join(ROOT, 'src', path, 'index.ts')) && !index.includes(`'${path}'`)
    )
    expect(missing).toEqual([])
  })

  test('the playground groups each component by its folder', () => {
    const registry = readFileSync(join(ROOT, 'playground/registry.tsx'), 'utf8')
    const ids = (group: string) => {
      const start = registry.indexOf(`const ${group}: ComponentEntry[] = [`)
      const end = registry.indexOf('\n]\n', start)
      return [...registry.slice(start, end).matchAll(/^ {4}id: '([^']+)'/gm)].map((m) => m[1])
    }
    expect(ids('atoms').length).toBeGreaterThan(0)
    expect(ids('fragments').length).toBeGreaterThan(0)
    const atomNames = new Set(atomDirs.map((d) => d.name))
    const fragmentNames = new Set(fragmentDirs)
    expect(ids('atoms').filter((id) => !atomNames.has(id))).toEqual([])
    expect(ids('layoutPrimitives').filter((id) => !atomNames.has(id))).toEqual([])
    expect(ids('fragments').filter((id) => !fragmentNames.has(id))).toEqual([])
  })
})
