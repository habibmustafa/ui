import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button, Dialog, Form, FormInput, FormSelect, toast } from '../../src'
import { CodeSnippet } from '../code-snippet'
import { InstallCommand } from '../install-command'
import { Link } from '../router'

/*
 * Getting started: the shortest path from `npm i` to a themed app with a dialog, a
 * toast and a validated form. Every step's result is rendered live next to its code.
 */

const STEPS = [
  { id: 'install', title: 'Quraşdırın' },
  { id: 'styles', title: 'Stilləri qoşun' },
  { id: 'theme', title: 'ThemeProvider əlavə edin' },
  { id: 'first-component', title: 'İlk komponent' },
  { id: 'toast', title: 'Bildirişlər' },
  { id: 'forms', title: 'Formalar' },
  { id: 'theming', title: 'Rəngləri dəyişin' },
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

const STYLES_CODE = `// main.tsx — tətbiqin giriş faylında bir dəfə
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
      trigger={<Button variant="danger">Layihəni sil</Button>}
      title="Layihə silinsin?"
      description="Bu əməliyyat geri qaytarılmır."
      confirmText="Sil"
      confirmType="danger"
      onConfirm={async () => {
        await api.deleteProject() // gözləyərkən düymə "loading" olur
      }}
    />
  )
}`

const TOAST_CODE = `import { SonnerToaster, toast } from '@habibmustafa/ui'

// Tətbiqdə bir dəfə:
<SonnerToaster />

// İstənilən yerdən:
toast.success('Dəyişikliklər yadda saxlanıldı', {
  description: 'Bütün komanda yeni versiyanı görür.',
})`

const FORM_CODE = `import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Form, FormInput, FormSelect } from '@habibmustafa/ui'

const schema = z.object({
  name: z.string().min(2, 'Ən azı 2 simvol yazın.'),
  plan: z.string({ error: 'Plan seçin.' }),
})

export function SignupForm() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '' } })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(save)} className="flex flex-col gap-4">
        <FormInput name="name" label="Ad" />
        <FormSelect name="plan" label="Plan" options={plans} placeholder="Plan seçin" />
        <Button type="submit" variant="primary">Qeydiyyat</Button>
      </form>
    </Form>
  )
}`

const THEMING_CODE = `/* styles.css-dən SONRA yüklənən öz CSS faylınızda */
:root,
.light,
.dark {
  --primary-hue: 250; /* primary: keçidlər, primary mətn və fonlar (OKLCH tonu) */
  --surface-hue: 250; /* fon, mətn və sərhədlərin çaları */
}

/* Neytralların doyğunluğu. Açıq temada standart 0-dır (tam boz),
   ona görə --surface-hue orada yalnız bununla görünür. */
.light { --chroma: 0.008; }
.dark  { --chroma: 0.03; }`

const BRAND_CODE = `/* Brend şkalası: H S% L%, hər tema üçün ayrıca (tünd temada fonlar çox tünddür) */
.light {
  --brand-default: 250deg 60% 53%;
  --brand-400: 250deg 67% 67%;
  --brand-500: 250deg 78% 40%;
  --brand-600: 250deg 86% 26%;
}
.dark {
  --brand-default: 250deg 60% 60%;
  --brand-400: 250deg 100% 12%;
  --brand-500: 250deg 100% 22%;
  --brand-600: 250deg 60% 72%;
}
/* … həmçinin --brand-200 və --brand-300 */`

const plans = [
  { value: 'free', label: 'Pulsuz' },
  { value: 'team', label: 'Komanda' },
  { value: 'business', label: 'Biznes' },
]

const signupSchema = z.object({
  name: z.string().min(2, { error: 'Ən azı 2 simvol yazın.' }),
  plan: z.string({ error: 'Plan seçin.' }),
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
          toast.success(`Xoş gəldiniz, ${name}!`, {
            description: `${plans.find((p) => p.value === plan)?.label} planı seçildi.`,
          })
          form.reset()
        })}
        className="flex w-full max-w-xs flex-col gap-4"
      >
        <FormInput name="name" label="Ad" />
        <FormSelect name="plan" label="Plan" options={plans} placeholder="Plan seçin" />
        <Button type="submit" variant="primary">
          Qeydiyyat
        </Button>
      </form>
    </Form>
  )
}

export default function GettingStartedPage() {
  return (
    <div>
      <h1 className="scroll-m-20 text-3xl tracking-tight">Başlanğıc</h1>
      <p className="mt-2 text-lg text-foreground-light">
        Quraşdırmadan işləyən formaya qədər yeddi addım. Hər addımın nəticəsi kodun yanında canlı
        göstərilir.
      </p>
      <nav aria-label="Addımlar" className="mt-6 mb-10 flex flex-wrap gap-x-4 gap-y-1 border-b pb-4 text-sm">
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
          Paket React 19 və React DOM 19 tələb edir. Tailwind quraşdırmağa ehtiyac yoxdur: stillər
          hazır CSS faylı kimi gəlir.
        </p>
        <InstallCommand packages="@habibmustafa/ui" />
      </Step>

      <Step id="styles">
        <p>Bütün komponentlərin stilləri və tema tokenləri bir fayldadır. Onu tətbiqin girişində bir dəfə import edin.</p>
        <CodeSnippet code={STYLES_CODE} />
      </Step>

      <Step id="theme">
        <p>
          {code('ThemeProvider')} seçilmiş temanı {code('html')} elementinə yazır, seçimi yadda
          saxlayır və {code('system')} rejimində əməliyyat sisteminin dəyişikliyini canlı izləyir.
        </p>
        <CodeSnippet code={THEME_CODE} />
        <p>Temanı koddan oxumaq və dəyişmək üçün {code('useTheme')}:</p>
        <CodeSnippet code={THEME_HOOK_CODE} />
      </Step>

      <Step id="first-component">
        <p>
          Çox işlənən komponentlər props ilə bir elementdə yazılır. {code('onConfirm')} Promise
          qaytaranda təsdiq düyməsi gözləyir, sonra dialoq özü bağlanır.
        </p>
        <CodeSnippet code={FIRST_COMPONENT_CODE} />
        <Live>
          <Dialog
            trigger={<Button variant="danger">Layihəni sil</Button>}
            title="Layihə silinsin?"
            description="Bu əməliyyat geri qaytarılmır."
            confirmText="Sil"
            cancelText="Ləğv et"
            confirmType="danger"
            onConfirm={() => new Promise((resolve) => setTimeout(resolve, 900))}
          />
        </Live>
        <p>
          Öz layout-unuz lazım olanda eyni komponenti hissələrlə yazın ({code('Dialog.Root')},{' '}
          {code('Dialog.Trigger')}, {code('Dialog.Content')}, …). Hər komponentin səhifəsində
          hər iki yazılışın kodu var.
        </p>
      </Step>

      <Step id="toast">
        <p>
          {code('SonnerToaster')}-i tətbiqə bir dəfə əlavə edin, sonra {code('toast')} funksiyasını
          istənilən yerdən çağırın.
        </p>
        <CodeSnippet code={TOAST_CODE} />
        <Live>
          <Button
            variant="default"
            onClick={() =>
              toast.success('Dəyişikliklər yadda saxlanıldı', {
                description: 'Bütün komanda yeni versiyanı görür.',
              })
            }
          >
            Bildiriş göstər
          </Button>
        </Live>
      </Step>

      <Step id="forms">
        <p>
          {code('FormInput')}, {code('FormSelect')}, {code('FormDatePicker')} və digər sahələr
          react-hook-form-a bağlıdır: label, səhv mesajı, {code('aria-invalid')} və səhv sahəyə
          fokus özü işləyir. Yoxlama üçün zod əlavə edin:
        </p>
        <InstallCommand packages="react-hook-form zod @hookform/resolvers" />
        <CodeSnippet code={FORM_CODE} />
        <Live>
          <SignupFormDemo />
        </Live>
      </Step>

      <Step id="theming">
        <p>
          Fon, mətn, sərhəd və {code('primary')} rəngləri OKLCH-də bir neçə giriş dəyişənindən
          törəyir, ona görə komponent CSS-ini yazmadan tonu dəyişə bilərsiniz. Mövcud tokenlərin hamısı{' '}
          <Link to="/colors" className="focus-ring rounded-xs text-foreground underline underline-offset-2">
            Rənglər
          </Link>{' '}
          səhifəsindədir.
        </p>
        <CodeSnippet code={THEMING_CODE} lang="css" />
        <p>
          Düymələrin və vurğuların yaşıl brend şkalası ({code('--brand-default')},{' '}
          {code('--brand-200')} … {code('--brand-600')}) bu dəyişənlərdən törəmir, hər tema üçün
          ayrıca dəyərlərdir. Brend rəngini dəyişmək üçün onları da override edin:
        </p>
        <CodeSnippet code={BRAND_CODE} lang="css" />
      </Step>

      <div className="flex flex-col gap-3 rounded-md border bg-surface-75 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Hazırsınız</p>
          <p className="mt-1 text-sm text-foreground-light">
            Növbəti addım: lazım olan komponenti tapın, nümunəsini kopyalayın.
          </p>
        </div>
        <Button asChild variant="primary" iconRight={<ArrowRight />}>
          <Link to="/components">Komponentlərə bax</Link>
        </Button>
      </div>
    </div>
  )
}
