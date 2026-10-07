import type { SnippetLang } from './code-snippet'

/*
 * highlight(code, lang) → HTML, computed in a Web Worker (shiki never touches the
 * main bundle or thread) and cached, so revisiting a page or tab is instant. Falls
 * back to the main thread where Worker doesn't exist (tests).
 */

const results = new Map<string, string>()
const pending = new Map<string, Promise<string>>()
let worker: Worker | null = null
let nextId = 0
const waiting = new Map<number, (html: string) => void>()

const keyOf = (code: string, lang: SnippetLang) => `${lang}\u0000${code}`

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./highlight-worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<{ id: number; html: string }>) => {
      waiting.get(event.data.id)?.(event.data.html)
      waiting.delete(event.data.id)
    }
  }
  return worker
}

/** Already-highlighted HTML, for rendering without a flash of plain text. */
export function highlightedSync(code: string, lang: SnippetLang): string | undefined {
  return results.get(keyOf(code, lang))
}

export function highlight(code: string, lang: SnippetLang): Promise<string> {
  const key = keyOf(code, lang)
  const done = results.get(key)
  if (done !== undefined) return Promise.resolve(done)
  let promise = pending.get(key)
  if (!promise) {
    promise =
      typeof Worker === 'undefined'
        ? import('./shiki-highlighter').then(async ({ getHighlighter }) =>
            (await getHighlighter()).codeToHtml(code, { lang, theme: 'ui' })
          )
        : new Promise<string>((resolve) => {
            const id = nextId++
            waiting.set(id, resolve)
            getWorker().postMessage({ id, code, lang })
          })
    promise = promise.then((html) => {
      results.set(key, html)
      pending.delete(key)
      return html
    })
    pending.set(key, promise)
  }
  return promise
}
