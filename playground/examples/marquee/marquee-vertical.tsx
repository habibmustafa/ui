import { Marquee } from '../../../src'

const quotes = [
  'Replaced three tools with one.',
  'The docs are the product.',
  'Shipped in a weekend.',
  'Our designers stopped asking for pixel fixes.',
]

export default function MarqueeVertical() {
  return (
    <Marquee vertical fade pauseOnHover duration={20} className="h-48 w-72" aria-label="Quotes">
      {quotes.map((quote) => (
        <p key={quote} className="rounded-md border bg-surface-100 p-3 text-sm">
          {quote}
        </p>
      ))}
    </Marquee>
  )
}
