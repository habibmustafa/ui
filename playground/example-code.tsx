import { useEffect, useState } from 'react'
import { CodeSnippet } from './code-snippet'

const sources = Object.fromEntries(Object.entries(import.meta.glob<string>('./examples/**/*.tsx', { query: '?raw', import: 'default' })).map(([path, loader]) => [path.split('/').pop()!.replace(/\.tsx$/, ''), loader]))
const cache = new Map<string, string>()

export default function ExampleCode({ name }: { name: string }) {
  const [source, setSource] = useState(() => cache.get(name) ?? '')
  useEffect(() => {
    let active = true
    setSource(cache.get(name) ?? '')
    if (!cache.has(name)) void sources[name]?.().then(raw => {
      const text = raw.replace(/(['"])(?:\.\.\/)+src\1/g, "'@habibmustafa/ui'").trim()
      cache.set(name, text)
      if (active) setSource(text)
    })
    return () => { active = false }
  }, [name])
  return <CodeSnippet code={source} />
}
