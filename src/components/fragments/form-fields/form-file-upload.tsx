import * as React from 'react'
import { FormField } from '../../atoms/forms/form'
import { FileUpload, type FileUploadProps } from '../../atoms/forms/file-upload'
import { FormItemLayout } from '../form-item-layout'
import { type FieldLayoutProps, splitLayout, LabelledControl } from './field-shared'

export interface FormFileUploadProps
  extends Omit<
      FileUploadProps,
      'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'label' | 'id'
    >,
    FieldLayoutProps {
  name: string
  /** Heading inside the drop zone (FileUpload's own `label`). */
  dropzoneLabel?: React.ReactNode
}

/** Value is a `File[]`. */
export function FormFileUpload({ name, dropzoneLabel, ...props }: FormFileUploadProps) {
  const [layoutProps, uploadProps] = splitLayout(props)
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItemLayout {...layoutProps}>
          <LabelledControl labelled={layoutProps.label != null}>
            {(labelId) => (
              <FileUpload
                {...uploadProps}
                label={dropzoneLabel}
                // The forwarded ref is the hidden file input; focusing it focuses Browse.
                ref={field.ref}
                aria-labelledby={labelId}
                value={field.value ?? []}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          </LabelledControl>
        </FormItemLayout>
      )}
    />
  )
}
