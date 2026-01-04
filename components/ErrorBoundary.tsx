'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border border-[var(--border-slate)] rounded-lg p-8 text-center bg-[var(--dark-slate)] bg-opacity-20">
          <div className="text-sm opacity-60">
            DATA UNAVAILABLE
          </div>
          <div className="text-xs opacity-40 mt-2">
            An error occurred while rendering this section
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
