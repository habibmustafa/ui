import { Button, Descriptions } from '../../../src'

export default function DescriptionsBordered() {
  return (
    <Descriptions
      title="Project"
      extra={<Button size="tiny">Edit</Button>}
      bordered
      layout="vertical"
      columns={2}
      items={[
        { label: 'Name', value: 'Billing API' },
        { label: 'Region', value: 'Frankfurt' },
        { label: 'Created', value: 'Jan 14, 2026' },
        { label: 'Owner', value: 'Platform team' },
        { label: 'Description', value: 'Handles invoices, payment retries and tax calculation.', span: 2 },
      ]}
    />
  )
}
