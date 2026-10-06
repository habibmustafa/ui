import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Form, FormControl, FormField, FormItemLayout, Select } from '../../../src'

const FormSchema = z.object({
  email: z
    .string({
      error: 'Please select an email to display.',
    })
    .email(),
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
    console.log(values)
    // action('form form.handleSubmit(onSubmit)')(values)
  }
  return (
    <Form {...form}>
      <form className="w-96 flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItemLayout
              label="Choose email"
              description="Choose preferred email"
              labelOptional="Optional"
            >
              <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a verified email to display" />
                  </Select.Trigger>
                </FormControl>
                <Select.Content>
                  <Select.Item value="m@example.com">m@example.com</Select.Item>
                  <Select.Item value="m@google.com">m@google.com</Select.Item>
                  <Select.Item value="m@support.com">m@support.com</Select.Item>
                </Select.Content>
              </Select.Root>
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
