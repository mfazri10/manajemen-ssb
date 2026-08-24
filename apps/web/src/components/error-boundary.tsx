'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  message: string;
}

/**
 * Error boundary global — menangkap error render yang tidak tertangani agar
 * seluruh app tidak blank, dan menampilkan layar pemulihan.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  override render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card border border-destructive/30 rounded-3xl p-8 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-black text-foreground tracking-tight">
            Terjadi Kesalahan
          </h2>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Halaman mengalami kendala saat ditampilkan. Anda dapat mencoba memuat ulang
            tampilan tanpa kehilangan sesi.
          </p>
          {this.state.message && (
            <p className="text-4xs font-mono text-destructive/80 bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2 break-all">
              {this.state.message}
            </p>
          )}
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-2xs rounded-xl cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Coba Lagi
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-border bg-background hover:bg-muted text-muted-foreground font-bold text-2xs rounded-xl cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </div>
    );
  }
}
