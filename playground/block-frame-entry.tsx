import { createRoot } from 'react-dom/client'
import { SonnerToaster, ThemeProvider } from '../src'
import BlockPreviewPage from './block-preview-page'
import { SiteTheme } from './site-theme'
import { PageErrorBoundary } from './page-error-boundary'

// Independent entry: no router, sidebar, gallery, docs or background prefetches
// are needed inside a single-screen preview.
const id = new URLSearchParams(window.location.search).get('preview') ?? ''
function Frame() {
  return <>
    <SiteTheme />
    <PageErrorBoundary resetKey={id}><BlockPreviewPage id={id} /></PageErrorBoundary>
    <SonnerToaster />
  </>
}
createRoot(document.getElementById('root')!).render(<ThemeProvider><Frame /></ThemeProvider>)
