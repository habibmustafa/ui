import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  AlertDialog,
  Button,
  Input,
  Label,
  Sheet,
} from '../../../src'

interface EndpointValues {
  endpointUrl: string
  secretHeader: string
}

interface ConfirmOnCloseModalProps {
  visible: boolean
  onClose: () => void
  onCancel: () => void
}

const defaultValues: EndpointValues = {
  endpointUrl: '',
  secretHeader: '',
}

const useConfirmOnClose = ({
  checkIsDirty,
  onClose,
}: {
  checkIsDirty: () => boolean
  onClose: () => void
}) => {
  const [visible, setVisible] = useState(false)

  const confirmOnClose = useCallback(() => {
    if (checkIsDirty()) {
      setVisible(true)
      return
    }

    onClose()
  }, [checkIsDirty, onClose])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        confirmOnClose()
      }
    },
    [confirmOnClose]
  )

  const onConfirm = useCallback(() => {
    setVisible(false)
    onClose()
  }, [onClose])

  const onCancel = useCallback(() => {
    setVisible(false)
  }, [])

  const modalProps: ConfirmOnCloseModalProps = useMemo(
    () => ({
      visible,
      onClose: onConfirm,
      onCancel,
    }),
    [visible, onConfirm, onCancel]
  )

  return {
    confirmOnClose,
    handleOpenChange,
    modalProps,
  }
}

const DiscardChangesAlertDialog = ({ visible, onClose, onCancel }: ConfirmOnCloseModalProps) => {
  const isConfirmingRef = useRef(false)

  useEffect(() => {
    if (visible) {
      isConfirmingRef.current = false
    }
  }, [visible])

  const handleConfirm = useCallback(() => {
    isConfirmingRef.current = true
    onClose()
  }, [onClose])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) return

      if (isConfirmingRef.current) {
        isConfirmingRef.current = false
        return
      }

      onCancel()
    },
    [onCancel]
  )

  return (
    <AlertDialog.Root open={visible} onOpenChange={handleOpenChange}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Discard changes?</AlertDialog.Title>
          <AlertDialog.Description>
            Any unsaved changes to this endpoint will be lost.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Keep editing</AlertDialog.Cancel>
          <AlertDialog.Action variant="danger" onClick={handleConfirm}>
            Discard changes
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}

export default function SheetConfirmOnClosePropsDemo() {
  const [open, setOpen] = useState(false)
  const [savedValues, setSavedValues] = useState<EndpointValues>(defaultValues)
  const [draftValues, setDraftValues] = useState<EndpointValues>(defaultValues)

  const isDirty = useMemo(
    () =>
      draftValues.endpointUrl !== savedValues.endpointUrl ||
      draftValues.secretHeader !== savedValues.secretHeader,
    [draftValues, savedValues]
  )

  const { confirmOnClose, handleOpenChange, modalProps } = useConfirmOnClose({
    checkIsDirty: () => isDirty,
    onClose: () => {
      setDraftValues(savedValues)
      setOpen(false)
    },
  })

  const openSheet = () => {
    setDraftValues(savedValues)
    setOpen(true)
  }

  const saveChanges = () => {
    setSavedValues(draftValues)
    setOpen(false)
  }

  return (
    <>
      <Button onClick={openSheet}>Open endpoint sheet</Button>

      <Sheet
        open={open}
        onOpenChange={handleOpenChange}
        title="Edit endpoint"
        slotProps={{ content: { className: 'flex flex-col gap-0' } }}
        footer={
          <>
            <Button onClick={confirmOnClose}>Cancel</Button>
            <Button variant="primary" onClick={saveChanges} disabled={!isDirty}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-confirm-props-endpoint-url">Endpoint URL</Label>
            <Input
              id="sheet-confirm-props-endpoint-url"
              value={draftValues.endpointUrl}
              placeholder="https://api.example.com/webhooks/events"
              onChange={(event) =>
                setDraftValues((current) => ({
                  ...current,
                  endpointUrl: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheet-confirm-props-secret-header">Secret header</Label>
            <Input
              id="sheet-confirm-props-secret-header"
              value={draftValues.secretHeader}
              placeholder="Bearer top-secret-value"
              onChange={(event) =>
                setDraftValues((current) => ({
                  ...current,
                  secretHeader: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </Sheet>
      <DiscardChangesAlertDialog {...modalProps} />
    </>
  )
}
