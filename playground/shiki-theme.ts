import type { ThemeRegistrationRaw } from 'shiki'

/**
 * Colors resolve from the --code-token-* variables vendored in
 * src/styles/vendor/theme/code-block-variables.css, so a code block follows
 * the active theme without being re-highlighted.
 *
 * Rules live in `settings`, not `tokenColors`: Shiki reads `settings` first and
 * only falls back to `tokenColors` when it is absent, so defining both (or an
 * empty `settings`) silently drops every rule.
 */
const settings: NonNullable<ThemeRegistrationRaw['settings']> = [
  {
    settings: {
      foreground: 'var(--code-foreground)',
      background: 'transparent',
    },
  },
  {
    scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
    settings: { foreground: 'var(--code-token-comment)' },
  },
  {
    scope: [
      'keyword',
      'storage',
      'storage.type',
      'storage.modifier',
      'variable.language',
      'support.type.primitive',
    ],
    settings: { foreground: 'var(--code-token-keyword)' },
  },
  {
    scope: [
      'constant',
      'constant.language',
      'entity.name.constant',
      'variable.other.constant',
      'variable.other.enummember',
      'support.constant',
    ],
    settings: { foreground: 'var(--code-token-constant)' },
  },
  {
    scope: ['constant.numeric', 'constant.character.numeric'],
    settings: { foreground: 'var(--code-token-number)' },
  },
  {
    scope: ['string', 'string.quoted', 'constant.character', 'constant.other.symbol'],
    settings: { foreground: 'var(--code-token-string)' },
  },
  {
    scope: [
      'string.template',
      'meta.template.expression',
      'punctuation.definition.template-expression',
    ],
    settings: { foreground: 'var(--code-token-string-expression)' },
  },
  {
    scope: [
      'entity.name.function',
      'support.function',
      'meta.function-call',
      'entity.name.tag',
      'support.class.component',
    ],
    settings: { foreground: 'var(--code-token-function)' },
  },
  {
    scope: ['variable.parameter', 'meta.parameters', 'variable.other.object'],
    settings: { foreground: 'var(--code-token-parameter)' },
  },
  {
    scope: [
      'support.type.property-name',
      'meta.object-literal.key',
      'entity.other.attribute-name',
      'variable.other.property',
      'meta.property-name',
    ],
    settings: { foreground: 'var(--code-token-property)' },
  },
  {
    scope: ['punctuation', 'meta.brace', 'keyword.operator'],
    settings: { foreground: 'var(--code-token-punctuation)' },
  },
  {
    scope: ['markup.underline.link', 'string.other.link'],
    settings: { foreground: 'var(--code-token-link)' },
  },
]

export const uiCodeTheme: ThemeRegistrationRaw = {
  name: 'ui',
  type: 'dark',
  colors: {
    'editor.foreground': 'var(--code-foreground)',
    'editor.background': 'transparent',
  },
  settings,
}
