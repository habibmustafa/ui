/*
 * Diffs our design tokens against the live Supabase design system.
 *
 * Downloads the CSS the site actually serves and compares every CSS custom property
 * both sides define. A drifted value here is a visual difference that no amount of
 * reading component source will reveal.
 *
 * Run after `npm run build:lib`. Needs network access.
 */

import { readFileSync } from 'node:fs'

const PAGE = 'https://supabase.com/design-system/docs/components/button'
const ORIGIN = 'https://supabase.com'

// Variables we deliberately differ on, with the reason.
const EXPECTED_DIFFERENCES = new Map([
  ['--font-sans', 'we add a fallback to the Next.js font variable so the stack is valid standalone'],
  ['--default-font-family', 'same font stack, written with a fallback'],
  ['--default-mono-font-family', 'same font stack, written with a fallback'],
  ['--default-transition-duration', 'softer motion system: 200ms instead of 150ms (src/styles/motion.css)'],
  ['--default-transition-timing-function', 'softer motion system: ease-soft-out instead of the stock ease-in-out'],
  ['--animate-accordion-down', 'softer motion system: longer, symmetric ease (src/styles/motion.css)'],
  ['--animate-accordion-up', 'softer motion system: longer, symmetric ease (src/styles/motion.css)'],
  ['--surface-hue', 'a separate input that defaults to --hue, so the theme builder can tint neutrals independently'],
  ['--destructive-lightness', 'dark-mode destructive text raised 0.55 -> 0.62: it measured 3.4:1 on cards, now 4.5:1'],
  ['--chart-2', 'follows the default accent (violet) like createTheme({ accent }) does, instead of a fixed blue; tests/chart-defaults.test.ts'],
  ['--chart-2-fill', 'same: the soft fill the generator produces for the default accent'],
])

// Only compare declarations from theme blocks. Variables declared inside ordinary
// utility rules (--hit-area-*, --tw-*) take whichever value that utility happens to
// instantiate, so comparing them reports noise rather than design drift.
const THEME_SELECTOR = /(^|[,}])\s*(:root|html|\.light|\.dark|\[data-theme[^\]]*\])[^{}]*$/

function variables(css) {
  const found = new Map()
  for (const match of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    if (!THEME_SELECTOR.test(match[1])) continue
    for (const declaration of match[2].matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;}]+)/g)) {
      if (!found.has(declaration[1])) found.set(declaration[1], declaration[2].trim())
    }
  }
  return found
}

const normalise = (value) => value.replace(/\s+/g, '').replace(/["']/g, '')

const page = await fetch(PAGE).then((response) => response.text())
const hrefs = [...new Set([...page.matchAll(/\/design-system\/_next\/[^"']+?\.css/g)].map((m) => m[0]))]

if (hrefs.length === 0) {
  console.error('Could not find any stylesheet on the page; the site layout may have changed.')
  process.exit(1)
}

const siteCss = (
  await Promise.all(hrefs.map((href) => fetch(ORIGIN + href).then((response) => response.text())))
).join('\n')

const site = variables(siteCss)
const ours = variables(readFileSync('dist/styles.css', 'utf8'))

const drifted = []
for (const [name, value] of site) {
  if (!ours.has(name)) continue
  if (normalise(value) === normalise(ours.get(name))) continue
  drifted.push([name, value, ours.get(name)])
}

const unexpected = drifted.filter(([name]) => !EXPECTED_DIFFERENCES.has(name))

console.log(
  `Site defines ${site.size} variables, we define ${ours.size}; ` +
    `${[...site.keys()].filter((name) => ours.has(name)).length} are shared.`
)

if (unexpected.length === 0) {
  console.log('No unexpected drift.')
  process.exit(0)
}

console.log(`\n${unexpected.length} drifted:`)
for (const [name, theirs, mine] of unexpected) {
  console.log(`  ${name}\n    site: ${theirs.slice(0, 100)}\n    ours: ${mine.slice(0, 100)}`)
}
process.exitCode = 1
