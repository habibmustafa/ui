import { COMPONENT_GROUPS, type ComponentEntry } from './registry'

/*
 * The playground's navigation groups components by role — the same folders they live
 * in (src/components/atoms/<role>/<id>, src/components/fragments/<id>), so the site and
 * the source tree never disagree. The glob only reads file *paths*; no module loads.
 */

const atomPaths = Object.keys(import.meta.glob('../src/components/atoms/*/*/index.ts'))

const ROLE_OF = new Map(
  atomPaths.map((path) => {
    const [, role, id] = /atoms\/([^/]+)\/([^/]+)\/index\.ts$/.exec(path)!
    return [id, role]
  })
)

export interface CatalogGroup {
  /** URL-safe key, used as `/components?group=<key>`. */
  key: string
  title: string
  entries: ComponentEntry[]
}

const ROLES: { key: string; title: string }[] = [
  { key: 'forms', title: 'Forms' },
  { key: 'actions', title: 'Actions' },
  { key: 'overlay', title: 'Overlay' },
  { key: 'navigation', title: 'Navigation' },
  { key: 'feedback', title: 'Feedback' },
  { key: 'data-display', title: 'Data display' },
  { key: 'layout', title: 'Layout' },
]

const allEntries = COMPONENT_GROUPS.flatMap((group) => group.entries)
// The English catalog must have the same order on the build machine and in every
// browser. In Azerbaijani collation, for example, Q sorts before M.
const byTitle = (a: ComponentEntry, b: ComponentEntry) => a.title.localeCompare(b.title, 'en')

export const CATALOG: CatalogGroup[] = [
  ...ROLES.map((role) => ({
    ...role,
    entries: allEntries.filter((entry) => ROLE_OF.get(entry.id) === role.key).sort(byTitle),
  })),
  {
    key: 'fragments',
    title: 'Fragments',
    entries: allEntries.filter((entry) => !ROLE_OF.has(entry.id)).sort(byTitle),
  },
]

export const COMPONENT_COUNT = allEntries.length
