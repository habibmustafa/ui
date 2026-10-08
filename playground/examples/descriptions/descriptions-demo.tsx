import { Badge, Descriptions } from '../../../src'

export default function DescriptionsDemo() {
  return (
    <Descriptions
      title="Order #4821"
      columns={3}
      items={[
        { label: 'Customer', value: 'Ada Lovelace' },
        { label: 'Email', value: 'ada@example.com' },
        { label: 'Status', value: <Badge variant="success">Paid</Badge> },
        { label: 'Total', value: '$1,284.00' },
        { label: 'Shipping', value: 'Express' },
        { label: 'Coupon' },
        { label: 'Address', value: '12 Analytical Way, London, UK', span: 3 },
      ]}
    />
  )
}
