import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional friendly label for the chart, used in the fallback message. */
  label?: string;
}
interface State {
  hasError: boolean;
}

/**
 * Bug #173: Localized error boundary so a single chart failure (bad data, NaN
 * domain, missing field, Recharts internal crash) doesn't take the whole admin
 * dashboard down. Wrap each `<ResponsiveContainer>` with this.
 */
export class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Bug #173: keep noisy charts from spamming Sentry/console with the same
    // recoverable error every render — log once per mount.
    // eslint-disable-next-line no-console
    console.error("[ChartErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center text-sm text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
          <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
          <p className="font-medium">Could not load {this.props.label ?? "chart"}.</p>
          <p className="text-xs mt-1">Try reloading the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
