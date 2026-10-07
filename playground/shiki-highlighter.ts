import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import css from 'shiki/langs/css.mjs'
import shellscript from 'shiki/langs/shellscript.mjs'
import tsx from 'shiki/langs/tsx.mjs'

import { uiCodeTheme } from './shiki-theme'

// The playground highlights TSX (examples), CSS (theming) and shell (install) only, so
// building against shiki's full bundle (every language + theme it ships, ~150 extra
// chunks) buys nothing. This loads just those grammars, the one (custom) theme, and the no-wasm JS regex
// engine instead of oniguruma.
let highlighterPromise: Promise<HighlighterCore> | null = null

export function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    langs: [tsx, css, shellscript],
    themes: [uiCodeTheme],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighterPromise
}
