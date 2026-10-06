'use client'

/*
 * Upstream's demo formats dates with `date-fns`. We already carry `dayjs` (added for
 * MetricCard's sparkline tooltip), so this uses dayjs instead of adding a second
 * date library for playground demos — same rationale as date-picker-demo.tsx.
 */
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Calendar, DatePicker, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../src'

const FormSchema = z.object({
  dob: z.date({
    error: 'A date of birth is required.',
  }),
})

export default function DatePickerForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast('You submitted the following values:', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-foreground p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dob"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <DatePicker.Root>
                <FormControl>
                  <DatePicker.Trigger asChild>
                    <DatePicker.Button isInvalid={fieldState.invalid}>
                      {field.value ? dayjs(field.value).format('MMMM D, YYYY') : 'Pick a date'}
                    </DatePicker.Button>
                  </DatePicker.Trigger>
                </FormControl>
                <DatePicker.Content>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    autoFocus
                  />
                </DatePicker.Content>
              </DatePicker.Root>
              <FormDescription>Your date of birth is used to calculate your age.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
