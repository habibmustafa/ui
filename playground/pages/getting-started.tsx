import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Dialog, Form, FormInput, FormSelect, toast } from '../../src'
import { CodeSnippet } from '../code-snippet'
import { InstallCommand } from '../install-command'
import { PageHeader } from '../page-header'
import { Link } from '../router'

/*
 * Getting started: the shortest path from `npm i` to a themed app with a dialog, a
 * toast and a validated form. Every step's result is rendered live next to its code.
 */

const STEPS = [
  { id: 'install', title: 'Install' },
  { id: 'styles', title: 'Import the styles' },
  { id: 'theme', title: 'Add ThemeProvider' },
  { id: 'first-component', title: 'Your first component' },
  { id: 'toast', title: 'Toasts' },
  { id: 'forms', title: 'Forms' },
  { id: 'theming', title: 'Make it yours' },
] as const

type StepId = (typeof STEPS)[number]['id']

function Step({ id, children }: { id: StepId; children: ReactNode }) {
  const index = STEPS.findIndex((step) => step.id === id)
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative scroll-mt-20 pb-12 pl-10">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border bg-surface-100 font-mono text-xs text-foreground-light"
      >
        {index + 1}
      </span>
      {index < STEPS.length - 1 && (
        <span aria-hidden="true" className="absolute bottom-0 left-[13.5px] top-9 w-px bg-border" />
      )}
      <h2 id={`${id}-title`} className="text-xl tracking-tight text-foreground">
        {STEPS[index].title}
      </h2>
      <div className="mt-3 flex flex-col gap-4 text-sm leading-relaxed text-foreground-light">
        {children}
      </div>
    </section>
  )
}

function Live({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-md border bg-surface-75 p-6">
      {children}
    </div>
  )
}

const code = (text: string) => (
  <code className="rounded-xs bg-surface-200 px-1 py-0.5 font-mono text-[13px] text-foreground">
    {text}
  </code>
)

const STYLES_CODE = `// main.tsx — once, in your app's entry file
import '@habibmustafa/ui/styles.css'`

const THEME_CODE = `import { ThemeProvider } from '@habibmustafa/ui'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system">
    <App />
  </ThemeProvider>
)`

const THEME_HOOK_CODE = `const { theme, resolvedTheme, setTheme } = useTheme()
setTheme('dark') // 'light' | 'dark' | 'system'`

const FIRST_COMPONENT_CODE = `import { Button, Dialog } from '@habibmustafa/ui'

export function DeleteProject() {
  return (
    <Dialog
      trigger={<Button variant="danger">Delete project</Button>}
      title="Delete this project?"
      description="This action cannot be undone."
      confirmText="Delete"
      confirmType="danger"
      onConfirm={async () => {
        await api.deleteProject() // the button shows a spinner while this runs
      }}
    />
  )
}`

const TOAST_CODE = `import { SonnerToaster, toast } from '@habibmustafa/ui'

// Once, in your app:
<SonnerToaster />

// Anywhere:
toast.success('Changes saved', {
  description: 'Everyone on the team now sees the new version.',
})`

const FORM_CODE = `import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Form, FormInput, FormSelect } from '@habibmustafa/ui'

const schema = z.object({
  name: z.string().min(2, 'Use at least 2 characters.'),
  plan: z.string({ error: 'Pick a plan.' }),
})

export function SignupForm() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '' } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(save)} className="flex flex-col gap-4">
        <FormInput name="name" label="Name" />
        <FormSelect name="plan" label="Plan" options={plans} placeholder="Pick a plan" />
        <Button type="submit" variant="primary">Sign up</Button>
      </form>
    </Form>
  )
}`

const THEMING_CODE = `import { ThemeProvider, createTheme } from '@habibmustafa/ui'

// The whole brand scale (light and dark) is generated from one color.
const theme = createTheme({
  brand: '#6366f1',     // buttons, links, focus
  accent: '#ec4899',    // info color, second chart series
  neutral: { tint: 0.2 }, // a light brand tint on surfaces (0 = gray)
  radius: 8,            // rounded-md; the other sizes scale with it
})

<ThemeProvider tokens={theme}>
  <App />
</ThemeProvider>`

const THEMING_CSS_CODE = `import { themeToCss } from '@habibmustafa/ui'

// At build time or on the server: the same theme as static CSS
const css = themeToCss({ brand: '#6366f1', radius: 8 })`

const plans = [
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team' },
  { value: 'business', label: 'Business' },
]

const signupSchema = z.object({
  name: z.string().min(2, { error: 'Use at least 2 characters.' }),
  plan: z.string({ error: 'Pick a plan.' }),
})

function SignupFormDemo() {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '' },
  })

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(({ name, plan }) => {
          toast.success(`Welcome, ${name}!`, {
            description: `You picked the ${plans.find((p) => p.value === plan)?.label} plan.`,
          })
          form.reset()
        })}
        className="flex w-full max-w-xs flex-col gap-4"
      >
        <FormInput name="name" label="Name" />
        <FormSelect name="plan" label="Plan" options={plans} placeholder="Pick a plan" />
        <Button type="submit" variant="primary">
          Sign up
        </Button>
      </form>
    </Form>
  )
}

export default function GettingStartedPage() {
  return (
    <div>
      <PageHeader title="Getting started" eyebrow="From idea to interface" description="Seven steps from install to a working, validated form. Each step shows its result live next to the code." divider={false} />
      <nav aria-label="Steps" className="mt-6 mb-10 flex flex-wrap gap-x-4 gap-y-1 border-b pb-4 text-sm">
        {STEPS.map((step, index) => (
          <a
            key={step.id}
            href={`#${step.id}`}
            className="focus-ring rounded-sm text-foreground-light transition-colors hover:text-foreground"
          >
            <span className="font-mono text-xs text-foreground-muted">{index + 1}.</span> {step.title}
          </a>
        ))}
      </nav>

      <Step id="install">
        <p>
          Requires React 19 and React DOM 19. You don't need to install Tailwind: the styles ship as a
          ready-made CSS file.
        </p>
        <InstallCommand packages="@habibmustafa/ui" />
      </Step>

      <Step id="styles">
        <p>Every component's styles and the theme tokens live in one file. Import it once in your app's entry.</p>
        <CodeSnippet code={STYLES_CODE} />
      </Step>

      <Step id="theme">
        <p>
          {code('ThemeProvider')} writes the chosen theme to the {code('html')} element, remembers the
          choice and, in {code('system')} mode, follows the operating system as it changes.
        </p>
        <CodeSnippet code={THEME_CODE} />
        <p>To read or change the theme from code, use {code('useTheme')}:</p>
        <CodeSnippet code={THEME_HOOK_CODE} />
      </Step>

      <Step id="first-component">
        <p>
          Common components are a single element driven by props. When {code('onConfirm')} returns a
          Promise, the confirm button waits for it and the dialog then closes itself.
        </p>
        <CodeSnippet code={FIRST_COMPONENT_CODE} />
        <Live>
          <Dialog
            trigger={<Button variant="danger">Delete project</Button>}
            title="Delete this project?"
            description="This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            confirmType="danger"
            onConfirm={() => new Promise((resolve) => setTimeout(resolve, 900))}
          />
        </Live>
        <p>
          When you need your own layout, compose the same component from parts ({code('Dialog.Root')},{' '}
          {code('Dialog.Trigger')}, {code('Dialog.Content')}, …). Every component page shows the code
          for both styles.
        </p>
      </Step>

      <Step id="toast">
        <p>
          Add {code('SonnerToaster')} to your app once, then call {code('toast')} from anywhere.
        </p>
        <CodeSnippet code={TOAST_CODE} />
        <Live>
          <Button
            variant="default"
            onClick={() =>
              toast.success('Changes saved', {
                description: 'Everyone on the team now sees the new version.',
              })
            }
          >
            Show a toast
          </Button>
        </Live>
      </Step>

      <Step id="forms">
        <p>
          {code('FormInput')}, {code('FormSelect')}, {code('FormDatePicker')} and the other fields are
          wired to react-hook-form: the label, error message, {code('aria-invalid')} and focus on the
          invalid field all just work. Add zod for validation:
        </p>
        <InstallCommand packages="react-hook-form zod @hookform/resolvers" />
        <CodeSnippet code={FORM_CODE} />
        <Live>
          <SignupFormDemo />
        </Live>
      </Step>

      <Step id="theming">
        <p>
          The easiest way is the{' '}
          <Link to="/theme" className="focus-ring rounded-xs text-foreground underline underline-offset-2">
            theme builder
          </Link>
          : pick colors, contrast, radius and fonts, see the result live, then take it as a CSS file or
          as code. The same generator ships in the library:
        </p>
        <CodeSnippet code={THEMING_CODE} />
        <p>
          {code('createTheme')} keeps every step's light/dark structure (button text stays readable) and
          only changes the keys you pass. For static CSS (SSR, a separate file) use{' '}
          {code('themeToCss')} and load the result after {code('styles.css')}.
        </p>
        <CodeSnippet code={THEMING_CSS_CODE} />
      </Step>

      <div className="flex flex-col gap-3 rounded-md border bg-surface-75 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">You're set</p>
          <p className="mt-1 text-sm text-foreground-light">
            Next: find the component you need and copy its example.
          </p>
        </div>
        <Button asChild variant="primary" iconRight={<ArrowRight />}>
          <Link to="/components">Browse components</Link>
        </Button>
      </div>
    </div>
  )
}
