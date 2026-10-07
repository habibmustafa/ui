import { ArrowRight, BookOpen } from 'lucide-react'

import { Button, Dialog, Tabs, THEME_PRESETS } from '../../src'
import { version } from '../../package.json'
import { CATALOG, COMPONENT_COUNT } from '../catalog'
import { CodeSnippet } from '../code-snippet'
import { GithubIcon } from '../icons'
import { InstallCommand } from '../install-command'
import { Link } from '../router'
import { PRESET_LABELS, fromConfig, stateToQuery } from '../theme-store'
import { Showcase } from './home-showcase'

const GITHUB_URL = 'https://github.com/habibmustafa/ui'

const PROPS_CODE = `<Dialog
  trigger={<Button variant="danger">Layihəni sil</Button>}
  title="Layihə silinsin?"
  description="Bu əməliyyat geri qaytarılmır."
  confirmText="Sil"
  confirmType="danger"
  onConfirm={deleteProject}
/>`

const COMPOUND_CODE = `<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button variant="danger">Layihəni sil</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Layihə silinsin?</Dialog.Title>
      <Dialog.Description>Bu əməliyyat geri qaytarılmır.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button variant="default">Ləğv et</Button>
      </Dialog.Close>
      <Button variant="danger" onClick={deleteProject}>Sil</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>`

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 max-w-2xl">
      <h2 className="text-2xl tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-foreground-light">{description}</p>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative isolate pt-6 pb-14 sm:pt-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(oklch(from_var(--foreground-default)_l_c_h_/_0.05)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_60%_60%_at_50%_30%,#000_40%,transparent_100%)]"
      />
      <a
        href={`${GITHUB_URL}/blob/main/CHANGELOG.md`}
        target="_blank"
        rel="noreferrer"
        className="focus-ring inline-flex items-center gap-2 rounded-full border bg-surface-100 px-3 py-1 text-xs text-foreground-light transition-colors hover:border-foreground-muted hover:text-foreground"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-default" aria-hidden="true" />
        v{version} — dəyişikliklər
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </a>
      <h1 className="mt-5 max-w-3xl text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
        React 19 üçün hazır, əlçatan komponentlər
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-foreground-light">
        Radix və Tailwind CSS v4 üzərində {COMPONENT_COUNT} komponent. Hamısı klaviatura və ekran
        oxuyucu ilə işləyir, açıq və tünd temanı dəstəkləyir, formalar react-hook-form ilə bir
        sətirdə qoşulur.
      </p>
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end">
        <InstallCommand packages="@habibmustafa/ui" className="w-full max-w-md" />
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary" size="medium" iconRight={<ArrowRight />}>
            <Link to="/getting-started">Başlanğıc</Link>
          </Button>
          <Button asChild variant="default" size="medium" icon={<BookOpen />}>
            <Link to="/components">Komponentlər</Link>
          </Button>
          <Button asChild variant="text" size="medium" icon={<GithubIcon />}>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

function HybridApi() {
  return (
    <section className="py-14">
      <SectionHeading
        title="Bir komponent, iki yazılış"
        description="Tez-tez işlənən komponentlər props ilə bir sətirdə yazılır. Layout lazım olanda eyni komponent hissələrə bölünür. İkisi də eyni dialoqu açır."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border bg-surface-75 p-8">
          <Dialog
            trigger={<Button variant="danger">Layihəni sil</Button>}
            title="Layihə silinsin?"
            description="Bu əməliyyat geri qaytarılmır."
            confirmText="Sil"
            cancelText="Ləğv et"
            confirmType="danger"
            onConfirm={() => new Promise((resolve) => setTimeout(resolve, 900))}
          />
          <p className="text-xs text-foreground-lighter">
            Fokus dialoqun içində qalır, Esc bağlayır.
          </p>
        </div>
        <Tabs.Root defaultValue="props">
          <Tabs.List className="gap-5">
            <Tabs.Trigger value="props">Props</Tabs.Trigger>
            <Tabs.Trigger value="compound">Compound</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="props">
            <CodeSnippet code={PROPS_CODE} />
          </Tabs.Content>
          <Tabs.Content value="compound">
            <CodeSnippet code={COMPOUND_CODE} maxHeight={360} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  )
}


function ThemeTeaser() {
  return (
    <section className="py-14">
      <SectionHeading
        title="Öz temanız"
        description="Bir brend rəngi seçin — açıq və tünd tema üçün bütün şkala, kontrast yoxlaması ilə birlikdə hesablanır. Nəticəni CSS və ya kod kimi götürün."
      />
      <div className="flex flex-col gap-4 rounded-md border bg-surface-75 p-5 md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-2" aria-label="Hazır temalar">
          {THEME_PRESETS.map((preset) => {
            const query = stateToQuery(fromConfig(preset.config))
            return (
              <li key={preset.id}>
                <Link
                  to={`/theme${query ? `?${query}` : ''}`}
                  className="focus-ring inline-flex h-8 items-center gap-2 rounded-full border bg-studio px-3 text-sm text-foreground-light transition-colors hover:border-foreground-muted hover:text-foreground"
                >
                  <span aria-hidden="true" className="flex -space-x-1">
                    <span className="h-3.5 w-3.5 rounded-full border border-background" style={{ background: preset.config.brand }} />
                    <span className="h-3.5 w-3.5 rounded-full border border-background" style={{ background: preset.config.accent }} />
                  </span>
                  {PRESET_LABELS[preset.id] ?? preset.name}
                </Link>
              </li>
            )
          })}
        </ul>
        <Button asChild variant="default" iconRight={<ArrowRight />} className="shrink-0">
          <Link to="/theme">Tema yaradıcısını aç</Link>
        </Button>
      </div>
    </section>
  )
}

function Catalog() {
  return (
    <section className="py-14">
      <SectionHeading
        title="Nə axtarırsınız?"
        description="Komponentlər roluna görə qruplaşdırılıb. Hər səhifədə canlı nümunə, kod və props cədvəli var."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATALOG.map((group) => (
          <Link
            key={group.key}
            to={`/components?group=${group.key}`}
            className="focus-ring group flex flex-col rounded-md border bg-studio p-4 transition-colors hover:border-foreground-lighter"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{group.title}</span>
              <span className="font-mono text-xs text-foreground-muted">{group.entries.length}</span>
            </span>
            <span className="mt-2 line-clamp-2 text-xs text-foreground-light">
              {group.entries
                .slice(0, 5)
                .map((entry) => entry.title)
                .join(', ')}
              {group.entries.length > 5 ? '…' : ''}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  const link = 'focus-ring rounded-xs transition-colors hover:text-foreground'
  return (
    <footer className="mt-6 flex flex-col gap-3 border-t py-8 text-sm text-foreground-lighter sm:flex-row sm:items-center sm:justify-between">
      <p>MIT lisenziyası · @habibmustafa/ui v{version}</p>
      <nav aria-label="Xarici keçidlər" className="flex gap-4">
        <a className={link} href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a
          className={link}
          href="https://www.npmjs.com/package/@habibmustafa/ui"
          target="_blank"
          rel="noreferrer"
        >
          npm
        </a>
        <a className={link} href={`${GITHUB_URL}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer">
          Dəyişikliklər
        </a>
      </nav>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div>
      <Hero />
      <section className="pb-14">
        <SectionHeading
          title="Canlı nümunələr"
          description="Bu kartlar yalnız kitabxananın öz komponentlərindən qurulub. Doldurub göndərə bilərsiniz."
        />
        <Showcase />
      </section>
      <HybridApi />
      <ThemeTeaser />
      <Catalog />
      <Footer />
    </div>
  )
}
