import { Carousel } from '../../../src'

export default function CarouselMultiple() {
  return (
    <Carousel.Root slidesPerView={3} gap={12} aria-label="Cards" className="mx-12 w-full max-w-lg">
      <Carousel.Content>
        {Array.from({ length: 6 }, (_, i) => (
          <Carousel.Item key={i}>
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-surface-100 text-xl font-medium">
              {i + 1}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Dots />
    </Carousel.Root>
  )
}
