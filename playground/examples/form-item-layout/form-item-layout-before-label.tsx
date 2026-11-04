import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, DataInput, Form, FormItemLayout, InfoTooltip } from '../../../src'

const FormSchema = z.object({
  functionName: z.string(),
})

export default function FormItemLayoutDemo() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof FormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    toast('You submitted the following values:', { description: JSON.stringify(values) })
  }
  return (
    <Form {...form}>
      <form className="w-96 flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <Form.Field
          control={form.control}
          name="functionName"
          render={({ field }) => (
            <FormItemLayout
              label="Function name"
              description="Name will also be used for the function name in postgres."
              labelOptional="Optional"
              beforeLabel={<InfoTooltip side="top">Added before the label</InfoTooltip>}
            >
              <Form.Control>
                <DataInput placeholder="Name of function" {...field} />
              </Form.Control>
            </FormItemLayout>
          )}
        />
        <Button size="small" variant="secondary" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
