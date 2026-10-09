import { AlertDialog, Button } from '../../../src'

export default function AlertDialogPropsDemo() {
  return (
    <AlertDialog
      trigger={<Button variant="outline">Show Alert Dialog</Button>}
      title="Create new API keys"
      description={<>This will create a default publishable key and a default secret key both named{' '}<code className="text-code-inline">default</code>. These keys are required to connect your application to your project.</>}
      onConfirm={() => {}}
      confirmText="Create keys"
    />
  )
}
