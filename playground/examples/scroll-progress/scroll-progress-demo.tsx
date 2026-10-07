import { useRef } from 'react'

import { ScrollProgress } from '../../../src'

export default function ScrollProgressDemo() {
  const box = useRef<HTMLDivElement>(null)
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-md border">
      <ScrollProgress target={box} position="absolute" label="Article progress" />
      <div ref={box} tabIndex={0} aria-label="Article" className="h-56 overflow-y-auto p-4 text-sm focus-ring">
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} className="mb-3 text-foreground-light">
            Paragraph {i + 1}. Scroll this box and the bar along its top edge fills as you read towards
            the end of the article.
          </p>
        ))}
      </div>
    </div>
  )
}
