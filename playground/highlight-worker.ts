/*
 * Syntax highlighting off the main thread: shiki's tokenizer is regex-heavy and a
 * page of snippets used to block input for over a second on a mid-range phone.
 */
import { getHighlighter } from './shiki-highlighter'

interface Request {
  id: number
  code: string
  lang: 'tsx' | 'css' | 'shellscript'
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const { id, code, lang } = event.data
  const highlighter = await getHighlighter()
  self.postMessage({ id, html: highlighter.codeToHtml(code, { lang, theme: 'ui' }) })
}
