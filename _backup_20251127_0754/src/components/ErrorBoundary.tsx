import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Captured error in subtree:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg text-red-300">
          <div className="font-semibold mb-2">Ocorreu um erro ao renderizar esta seção.</div>
          <div className="text-sm">Tente voltar ao dashboard. Em desenvolvimento, verifique o console para detalhes.</div>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;