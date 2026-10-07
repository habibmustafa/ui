'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, RadioGroup } from '../../../src'

const FormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none'], {
    error: 'You need to select a notification type.',
  }),
})

export default function RadioGroupForm() {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Notify me about...</FormLabel>
              <FormControl>
                <RadioGroup.Root
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroup.Item value="all" id="type-all" />
                    <FormLabel className="font-normal" htmlFor="type-all">
                      All new messages
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroup.Item value="mentions" id="type-mentions" />
                    <FormLabel className="font-normal" htmlFor="type-mentions">
                      Direct messages and mentions
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroup.Item value="none" id="type-none" />
                    <FormLabel className="font-normal" htmlFor="type-none">
                      Nothing
                    </FormLabel>
                  </div>
                </RadioGroup.Root>
              </FormControl>
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
