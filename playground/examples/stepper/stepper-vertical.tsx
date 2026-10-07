import { Stepper } from '../../../src'

export default function StepperVertical() {
  return (
    <Stepper
      orientation="vertical"
      activeStep={2}
      steps={[
        { title: 'Order placed', description: 'Oct 2, 09:14' },
        { title: 'Payment confirmed', description: 'Oct 2, 09:15' },
        { title: 'Shipped', description: 'Waiting for the courier' },
        { title: 'Delivered' },
      ]}
    />
  )
}
