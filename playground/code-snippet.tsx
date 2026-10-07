import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '../src'
import { getHighlighter } from './shiki-highlighter'

export type SnippetLang = 'tsx' | 'css' | 'shellscript'

/** Highlights `code` once shiki has loaded; plain text until then (same layout). */
function useHighlighted(code: string, lang: SnippetLang) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setHtml(null)
    getHighlighter().then((highlighter) => {
      if (active) setHtml(highlighter.codeToHtml(code, { lang, theme: 'ui' }))
    })
    return () => {
      active = false
    }
  }, [code, lang])

  return html
}

export function SnippetCopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      aria-label={copied ? 'Kopyalandı' : 'Kodu kopyala'}
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => setCopied(true))
      }}
      className={cn(
        'focus-ring absolute right-2 top-2 z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-border bg-surface-100 text-foreground-lighter transition-colors hover:text-foreground',
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

/** A highlighted, copyable code block. */
export function CodeSnippet({
  code,
  lang = 'tsx',
  className,
  maxHeight = 650,
}: {
  code: string
  lang?: SnippetLang
  className?: string
  maxHeight?: number
}) {
  const html = useHighlighted(code, lang)

  return (
    <div className={cn('relative w-full overflow-hidden rounded-md border bg-surface-75/75', className)}>
      <SnippetCopyButton value={code} />
      {html ? (
        <div
          className="code-content overflow-x-auto px-4 py-4 pr-12 font-mono text-sm [&_pre]:my-0 [&_pre]:bg-transparent!"
          style={{ maxHeight }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="code-content overflow-x-auto px-4 py-4 pr-12 font-mono text-sm text-foreground-light"
          style={{ maxHeight }}
        >
          {code}
        </pre>
      )}
    </div>
  )
}
