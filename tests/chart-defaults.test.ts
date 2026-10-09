// The default chart series 2 is the generator's output for the default accent, so the
// default theme and createTheme({ accent }) never drift apart.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'

import { DEFAULT_THEME, createTheme } from '../src/theme'

const css = readFileSync(join(__dirname, '../src/styles/vendor/theme/charts.css'), 'utf8')

test('charts.css has the generated series-2 colors for the default accent', () => {
  const theme = createTheme({ accent: DEFAULT_THEME.accent })
  for (const [mode, vars] of [
    ['light', theme.light],
    ['dark', theme.dark],
  ] as const) {
    for (const name of ['--chart-2', '--chart-2-fill'] as const) {
      expect(css, `${mode} ${name}`).toContain(`${name}: ${vars[name]};`)
    }
  }
})
