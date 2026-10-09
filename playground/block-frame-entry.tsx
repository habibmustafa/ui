import { createRoot } from 'react-dom/client'
import { SonnerToaster, ThemeProvider, useTheme } from '../src'
import BlockPreviewPage from './block-preview-page'
import { SiteTheme } from './site-theme'
import { PageErrorBoundary } from './page-error-boundary'

// Independent entry: no router, sidebar, gallery, docs or background prefetches
// are needed inside a single-screen preview.
const id = new URLSearchParams(window.location.search).get('preview') ?? ''
function Frame() {
  const { resolvedTheme } = useTheme()
  return <>
    <SiteTheme active />
    <PageErrorBoundary resetKey={id}><BlockPreviewPage id={id} /></PageErrorBoundary>
    <SonnerToaster theme={resolvedTheme} />
  </>
}
createRoot(document.getElementById('root')!).render(<ThemeProvider><Frame /></ThemeProvider>)
