import { Button, Result } from '../../../src'

export default function ResultDemo() {
  return (
    <Result
      status="success"
      title="Payment received"
      description="Your invoice has been paid and a receipt is on its way to your inbox."
      extra={
        <>
          <Button variant="primary">View invoice</Button>
          <Button>Back to billing</Button>
        </>
      }
    />
  )
}
