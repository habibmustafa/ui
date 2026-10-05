import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import tsx from 'shiki/langs/tsx.mjs'

import { uiCodeTheme } from './shiki-theme'

// Every code tab in the playground highlights TSX only, so building against shiki's
// full bundle (every language + theme it ships, ~150 extra chunks) buys nothing.
// This loads just the one grammar, the one (custom) theme, and the no-wasm JS regex
// engine instead of oniguruma.
let highlighterPromise: Promise<HighlighterCore> | null = null

export function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    langs: [tsx],
    themes: [uiCodeTheme],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighterPromise
}
