import { Carousel } from '../../../src'

const slides = Array.from({ length: 6 }, (_, i) => (
  <div
    key={i}
    className="flex aspect-square items-center justify-center rounded-lg border bg-surface-100 text-xl font-medium"
  >
    {i + 1}
  </div>
))

export default function CarouselMultiplePropsDemo() {
  return <Carousel items={slides} slidesPerView={3} gap={12} aria-label="Cards" className="w-full max-w-lg" />
}
