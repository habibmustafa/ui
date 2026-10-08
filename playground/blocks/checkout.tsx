import { zodResolver } from '@hookform/resolvers/zod'
import { Banknote, CreditCard, Truck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Descriptions, Form, FormInput, NumberInput, RadioGroupCard, Result } from '../../src'

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  name: z.string().min(1, 'Enter the name on the parcel.'),
  address: z.string().min(1, 'Enter a street and number.'),
  city: z.string().min(1, 'Enter a city.'),
  postal: z.string().min(3, 'Enter a postal code.'),
})

const products = [
  { id: 'tee', name: 'Field tee', detail: 'Olive, size M', price: 28 },
  { id: 'bottle', name: 'Steel bottle', detail: '750 ml, matte black', price: 24 },
]

const payments = [
  { value: 'card', label: 'Card', note: 'You pay on a secure page next.', icon: <CreditCard /> },
  { value: 'transfer', label: 'Bank transfer', note: 'We ship once the money arrives.', icon: <Banknote /> },
  { value: 'delivery', label: 'Pay on delivery', note: 'Cash or card to the courier.', icon: <Truck /> },
]

const FREE_SHIPPING_FROM = 100
const SHIPPING = 8
const money = (value: number) => `$${value.toFixed(2)}`

export default function Checkout() {
  const [quantities, setQuantities] = useState<Record<string, number | null>>({ tee: 2, bottle: 1 })
  const [payment, setPayment] = useState('card')
  const [order, setOrder] = useState<string | null>(null)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '', address: '', city: '', postal: '' },
  })

  const subtotal = products.reduce((sum, product) => sum + product.price * (quantities[product.id] ?? 0), 0)
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING

  if (order) {
    return (
      <div className="w-full max-w-4xl rounded-xl border bg-surface-100 p-8 shadow-sm">
        <Result
          status="success"
          size="small"
          level={3}
          title="Order placed"
          description={`Order ${order} is on its way to you. A receipt is in your inbox.`}
          extra={<Button onClick={() => setOrder(null)}>Start a new order</Button>}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(() => setOrder('#4821'))}
        className="grid w-full max-w-4xl overflow-hidden rounded-xl border bg-surface-100 shadow-sm lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="flex flex-col gap-8 p-6">
          <section aria-labelledby="checkout-contact" className="flex flex-col gap-4">
            <h3 id="checkout-contact" className="text-sm font-medium text-foreground">
              Contact
            </h3>
            <FormInput name="email" label="Email" type="email" placeholder="name@company.com" autoComplete="email" />
          </section>

          <section aria-labelledby="checkout-delivery" className="flex flex-col gap-4">
            <h3 id="checkout-delivery" className="text-sm font-medium text-foreground">
              Delivery
            </h3>
            <FormInput name="name" label="Full name" autoComplete="name" />
            <FormInput name="address" label="Address" autoComplete="street-address" />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="city" label="City" autoComplete="address-level2" />
              <FormInput name="postal" label="Postal code" autoComplete="postal-code" />
            </div>
          </section>

          <section aria-labelledby="checkout-payment" className="flex flex-col gap-4">
            <h3 id="checkout-payment" className="text-sm font-medium text-foreground">
              Payment
            </h3>
            <RadioGroupCard
              aria-labelledby="checkout-payment"
              value={payment}
              onValueChange={setPayment}
              className="grid gap-3 sm:grid-cols-3"
              classNames={{
                item: 'w-full rounded-lg bg-surface-75 p-4 data-[state=checked]:border-brand-default data-[state=checked]:bg-brand-default/5 data-[state=checked]:ring-1 data-[state=checked]:ring-brand-default',
              }}
              options={payments.map((item) => ({
                value: item.value,
                label: (
                  <span className="flex flex-col gap-1.5 text-left">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-foreground-light">
                      <span aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="text-xs leading-relaxed text-foreground-light">{item.note}</span>
                  </span>
                ),
              }))}
            />
          </section>
        </div>

        <aside aria-labelledby="checkout-summary" className="flex flex-col gap-5 border-t bg-surface-75 p-6 lg:border-l lg:border-t-0">
          <h3 id="checkout-summary" className="text-sm font-medium text-foreground">
            Order summary
          </h3>
          <ul className="flex flex-col gap-4">
            {products.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-foreground-lighter">{product.detail}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-foreground-light">{money(product.price)} each</p>
                </div>
                <NumberInput
                  aria-label={`${product.name} quantity`}
                  value={quantities[product.id]}
                  onValueChange={(value) => setQuantities((current) => ({ ...current, [product.id]: value }))}
                  min={0}
                  max={9}
                  className="w-28 shrink-0"
                />
              </li>
            ))}
          </ul>
          <Descriptions
            columns={1}
            className="border-t pt-4"
            classNames={{ item: 'justify-between', value: 'text-right tabular-nums' }}
            items={[
              { label: 'Subtotal', value: money(subtotal) },
              { label: 'Shipping', value: shipping === 0 ? 'Free' : money(shipping) },
              { label: <span className="font-medium text-foreground">Total</span>, value: <span className="font-semibold text-foreground">{money(subtotal + shipping)}</span> },
            ]}
          />
          <p className="text-xs text-foreground-lighter">Shipping is free on orders from {money(FREE_SHIPPING_FROM)}.</p>
          <Button type="submit" variant="primary" size="medium" block disabled={subtotal === 0}>
            Place order
          </Button>
        </aside>
      </form>
    </Form>
  )
}
