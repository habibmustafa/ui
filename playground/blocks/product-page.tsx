import { Backpack, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

import { Accordion, Button, Carousel, NumberInput, Rating, ToggleGroup, toast } from '../../src'

const views = ['Front', 'Side pocket', 'Straps', 'On the trail']
const SIZES = [
  { value: '20', label: '20 L' },
  { value: '28', label: '28 L' },
  { value: '35', label: '35 L' },
]

export default function ProductPage() {
  const [size, setSize] = useState('28')
  const [quantity, setQuantity] = useState<number | null>(1)
  const [inCart, setInCart] = useState(0)

  return (
    <div className="grid w-full max-w-4xl gap-8 overflow-hidden rounded-xl border bg-surface-100 p-6 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-8">
      <div className="min-w-0 px-12">
        <Carousel.Root loop aria-label="Product photos">
          <Carousel.Content>
            {views.map((view) => (
              <Carousel.Item key={view}>
                <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-lg border bg-brand-default/5 text-foreground-light">
                  <Backpack className="h-16 w-16 text-brand-600" strokeWidth={1.25} aria-hidden="true" />
                  <span className="text-sm">{view}</span>
                </div>
              </Carousel.Item>
            ))}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
          <Carousel.Dots />
        </Carousel.Root>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">Trail backpack</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-foreground-light">
            <Rating aria-label="Average rating: 4.5 out of 5" value={4.5} allowHalf readOnly />
            <span>4.5 from 212 reviews</span>
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">$96.00</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground-light">
            Water-resistant, with a padded back panel and a pocket for a laptop up to 15 inches.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span id="product-size" className="text-sm font-medium text-foreground">
            Size
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            aria-labelledby="product-size"
            className="justify-start"
            value={size}
            onValueChange={(next: string) => next && setSize(next)}
            items={SIZES}
          />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Quantity</span>
            <NumberInput aria-label="Quantity" value={quantity} onValueChange={setQuantity} min={1} max={9} className="w-32" />
          </div>
          <Button
            variant="primary"
            size="medium"
            className="flex-1"
            icon={<ShoppingBag />}
            disabled={!quantity}
            onClick={() => {
              setInCart((current) => current + (quantity ?? 0))
              toast.success('Added to your cart')
            }}
          >
            Add to cart
          </Button>
        </div>
        <p className="text-xs text-foreground-lighter" aria-live="polite">
          {inCart === 0 ? 'Your cart is empty.' : `${inCart} ${inCart === 1 ? 'item' : 'items'} in your cart.`}
        </p>

        <Accordion
          type="single"
          collapsible
          className="border-t"
          items={[
            { value: 'details', trigger: 'Details', content: 'Recycled nylon shell, YKK zips, 1.1 kg. Machine washable at 30 degrees.' },
            { value: 'shipping', trigger: 'Shipping', content: 'Free from $100. Orders placed before 2 pm leave the same day.' },
            { value: 'returns', trigger: 'Returns', content: 'Send it back within 30 days if it is unused. We refund the full price.' },
          ]}
        />
      </div>
    </div>
  )
}
