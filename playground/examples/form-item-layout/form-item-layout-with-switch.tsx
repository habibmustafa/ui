import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Form, FormItemLayout, Switch } from '../../../src'

const FormSchema = z.object({
  switch_option: z.boolean().default(false).optional(),
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
          name="switch_option"
          render={({ field }) => (
            <FormItemLayout
              afterLabel="Switch"
              label="Use ./config directory for everything"
              description="This is an explanation."
              layout="flex"
            >
              <Form.Control>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
