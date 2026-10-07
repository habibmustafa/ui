import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '../src'

/*
 * Keeps one broken page from blanking the whole site: the header and sidebar stay
 * usable and the error is shown in place. Resets when the route changes (`resetKey`).
 */

interface Props {
  resetKey: string
  children: ReactNode
}

interface State {
  error: Error | null
  resetKey: string
}

export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div role="alert" className="mx-auto mt-10 max-w-xl rounded-md border bg-surface-75 p-6">
        <p className="text-base text-foreground">Bu səhifə yüklənmədi.</p>
        <p className="mt-2 text-sm text-foreground-light">
          Lokal işlədirsinizsə, asılılıqlar köhnə ola bilər: <code className="font-mono">npm install</code>{' '}
          edib yenidən yoxlayın.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-sm bg-surface-200 p-3 font-mono text-xs text-destructive">
          {error.message}
        </pre>
        <Button className="mt-4" variant="default" onClick={() => window.location.reload()}>
          Yenidən yüklə
        </Button>
      </div>
    )
  }
}
