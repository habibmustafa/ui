import {
  AlertDialog,
  Button,
} from '../../../src'

const createApiKeys = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200))
}

export default function AlertDialogAsync() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="outline">Show Alert Dialog</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Create new API keys</AlertDialog.Title>
          <AlertDialog.Description>
            This will create a default publishable key and a default secret key both named{' '}
            <code className="text-code-inline">default</code>. These keys are required to connect
            your application to your project.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onClick={createApiKeys}>Create keys</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
