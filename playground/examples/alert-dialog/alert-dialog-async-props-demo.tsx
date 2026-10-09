import { AlertDialog, Button } from '../../../src'

const createApiKeys = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200))
}

export default function AlertDialogAsyncPropsDemo() {
  return (
    <AlertDialog
      trigger={<Button variant="outline">Show Alert Dialog</Button>}
      title="Create new API keys"
      description={<>This will create a default publishable key and a default secret key both named{' '}<code className="text-code-inline">default</code>. These keys are required to connect your application to your project.</>}
      onConfirm={createApiKeys}
      confirmText="Create keys"
    />
  )
}
