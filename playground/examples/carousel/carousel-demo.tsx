import { Carousel } from '../../../src'

const labels = ['Design', 'Build', 'Ship', 'Learn']

export default function CarouselDemo() {
  return (
    <div className="w-full max-w-md px-12">
      <Carousel.Root loop aria-label="Product steps">
        <Carousel.Content>
          {labels.map((label, i) => (
            <Carousel.Item key={label}>
              <div className="flex h-40 items-center justify-center rounded-lg border bg-surface-100 text-2xl font-medium">
                {i + 1}. {label}
              </div>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Dots />
      </Carousel.Root>
    </div>
  )
}
