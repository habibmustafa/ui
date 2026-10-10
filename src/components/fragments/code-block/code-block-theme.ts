// Colors resolve from the --code-token-* variables (src/styles/vendor/theme/code-block-variables.css),
// the same palette the playground's Shiki theme uses, so a code block follows the
// active theme through CSS alone — no ThemeProvider or re-render needed.
const KEYWORD = { color: 'var(--code-token-keyword)', fontWeight: 'normal' }
const keyword = { color: 'var(--code-token-keyword)' }
const constant = { color: 'var(--code-token-constant)' }
const fn = { color: 'var(--code-token-function)', fontWeight: 'normal' }
const property = { color: 'var(--code-token-property)' }
const comment = { color: 'var(--code-token-comment)' }

export const codeBlockTheme = {
  hljs: {
    display: 'block',
    overflowX: 'auto',
    color: 'var(--code-foreground)',
  },
  'hljs-tag': keyword,
  'hljs-keyword': KEYWORD,
  'hljs-selector-tag': KEYWORD,
  'hljs-literal': KEYWORD,
  'hljs-strong': keyword,
  'hljs-name': keyword,
  'hljs-code': constant,
  'hljs-class .hljs-title': { color: 'var(--code-foreground)' },
  'hljs-attribute': property,
  'hljs-symbol': constant,
  'hljs-regexp': { color: 'var(--code-token-string-expression)' },
  'hljs-link': { color: 'var(--code-token-link)' },
  'hljs-string': { color: 'var(--code-token-string)' },
  'hljs-number': { color: 'var(--code-token-number)' },
  'hljs-params': { color: 'var(--code-token-parameter)' },
  'hljs-punctuation': { color: 'var(--code-token-punctuation)' },
  'hljs-bullet': constant,
  'hljs-subst': constant,
  'hljs-title': fn,
  'hljs-section': fn,
  'hljs-emphasis': constant,
  'hljs-type': fn,
  'hljs-built_in': constant,
  'hljs-builtin-name': constant,
  'hljs-selector-attr': property,
  'hljs-selector-pseudo': property,
  'hljs-addition': constant,
  'hljs-variable': property,
  'hljs-template-tag': constant,
  'hljs-template-variable': property,
  'hljs-comment': comment,
  'hljs-quote': comment,
  'hljs-deletion': comment,
  'hljs-meta': comment,
  'hljs-doctag': { fontWeight: 'normal' },
  'hljs-selector-id': { fontWeight: 'normal' },
}

/** @deprecated Use `codeBlockTheme`; colors now follow the theme through CSS, so the flag is ignored. */
export const monokaiCustomTheme = (_isDarkMode?: boolean) => codeBlockTheme
