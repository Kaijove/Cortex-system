import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

interface Props {
  children: ReactNode
  label?: string
}

interface State {
  hasError: boolean
  message: string
}

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Error desconegut' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WidgetErrorBoundary] ${this.props.label ?? 'widget'} failed to render:`, error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border p-6 text-center"
          style={{ background: 'var(--glass-fill)', borderColor: 'var(--signal-rose)' }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--signal-rose)' }} />
          <p className="text-[11px]" style={{ color: 'var(--text-hi)' }}>
            Aquest widget ha fallat en renderitzar-se{this.props.label ? `: ${this.props.label}` : ''}.
          </p>
          <p className="max-w-[240px] text-[10px]" style={{ color: 'var(--text-lo)' }}>{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="glass-panel flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px]"
            style={{ color: 'var(--signal-cyan)' }}
          >
            <RotateCw size={12} /> Reintenta
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
