import { Carousel } from '../../../src'

const slides = ['Design', 'Build', 'Ship', 'Learn'].map((label, i) => (
  <div
    key={label}
    className="flex h-40 items-center justify-center rounded-lg border bg-surface-100 text-2xl font-medium"
  >
    {i + 1}. {label}
  </div>
))

export default function CarouselPropsDemo() {
  return (
    <div className="w-full max-w-md">
      <Carousel items={slides} aria-label="Product steps" />
    </div>
  )
}
