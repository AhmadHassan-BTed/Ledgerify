import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in Ledgerify:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200 my-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <span>{this.props.fallbackTitle || 'A component encountered an issue rendering.'}</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300 font-mono">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recover View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
