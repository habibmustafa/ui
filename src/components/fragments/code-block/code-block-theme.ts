// Light-theme counterparts of the (dark-tuned) Monokai colors: same hues, darkened to
// reach at least 4.5:1 on light code backgrounds (WCAG AA). The originals measured
// 1.5–3.9:1 on white; dark mode keeps them unchanged.
const LIGHT: Record<string, string> = {
  '#569cd6': '#1d63a8',
  '#66d9ef': '#0a7086',
  '#bf79db': '#8a3db0',
  '#5eead4': '#0f766e',
  gray: '#666666',
  '#75715e': '#625e4c',
}

export const monokaiCustomTheme = (isDarkMode: boolean) => {
  const tone = (color: string) => (isDarkMode ? color : (LIGHT[color] ?? color))
  return {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      color: isDarkMode ? '#ddd' : '#444',
    },
    'hljs-tag': {
      color: tone('#569cd6'),
    },
    'hljs-keyword': {
      color: tone('#569cd6'),
      fontWeight: 'normal',
    },
    'hljs-selector-tag': {
      color: tone('#569cd6'),
      fontWeight: 'normal',
    },
    'hljs-literal': {
      color: tone('#569cd6'),
      fontWeight: 'normal',
    },
    'hljs-strong': {
      color: tone('#569cd6'),
    },
    'hljs-name': {
      color: tone('#569cd6'),
    },
    'hljs-code': {
      color: tone('#66d9ef'),
    },
    'hljs-class .hljs-title': {
      color: tone('gray'),
    },
    'hljs-attribute': {
      color: tone('#bf79db'),
    },
    'hljs-symbol': {
      color: tone('#bf79db'),
    },
    'hljs-regexp': {
      color: tone('#bf79db'),
    },
    'hljs-link': {
      color: tone('#bf79db'),
    },
    'hljs-string': {
      color: 'var(--primary)',
    },
    'hljs-bullet': {
      color: tone('#5eead4'),
    },
    'hljs-subst': {
      color: tone('#5eead4'),
    },
    'hljs-title': {
      color: tone('#5eead4'),
      fontWeight: 'normal',
    },
    'hljs-section': {
      color: tone('#5eead4'),
      fontWeight: 'normal',
    },
    'hljs-emphasis': {
      color: tone('#5eead4'),
    },
    'hljs-type': {
      color: tone('#5eead4'),
      fontWeight: 'normal',
    },
    'hljs-built_in': {
      color: tone('#5eead4'),
    },
    'hljs-builtin-name': {
      color: tone('#5eead4'),
    },
    'hljs-selector-attr': {
      color: tone('#5eead4'),
    },
    'hljs-selector-pseudo': {
      color: tone('#5eead4'),
    },
    'hljs-addition': {
      color: tone('#5eead4'),
    },
    'hljs-variable': {
      color: tone('#5eead4'),
    },
    'hljs-template-tag': {
      color: tone('#5eead4'),
    },
    'hljs-template-variable': {
      color: tone('#5eead4'),
    },
    'hljs-comment': {
      color: isDarkMode ? '#999' : '#6a6a6a',
    },
    'hljs-quote': {
      color: tone('#75715e'),
    },
    'hljs-deletion': {
      color: tone('#75715e'),
    },
    'hljs-meta': {
      color: tone('#75715e'),
    },
    'hljs-doctag': {
      fontWeight: 'normal',
    },
    'hljs-selector-id': {
      fontWeight: 'normal',
    },
  }
}
