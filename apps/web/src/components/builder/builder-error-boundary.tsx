"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

type Props = { children: ReactNode; storeSlug?: string };
type State = {
  error: Error | null;
  errorInfo?: {
    message: string;
    stack?: string;
    componentStack: string;
    storeSlug: string;
    timestamp: string;
  };
};

/**
 * Builder-level error boundary.
 *
 * Wraps the entire builder tree so that any uncaught exception — including
 * useRequiredStore() throwing during an unexpected race — is caught here
 * instead of propagating to the Next.js global error page.
 *
 * In development the error is printed to the console in full.
 * In production the user sees a friendly recovery screen.
 */
export class BuilderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Always print the full error in dev and prod so it's traceable.
    console.error("[Builder] Uncaught exception:", error, info.componentStack);

    // Store detailed error info for the UI (accessible in prod too).
    this.setState({
      errorInfo: {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        storeSlug: this.props.storeSlug ?? "unknown",
        timestamp: new Date().toISOString(),
      },
    });
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center bg-apple-canvas-parchment p-6">
          <div className="w-full max-w-md rounded-apple-lg border border-apple-hairline bg-apple-canvas p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a.875.875 0 100-1.75.875.875 0 000 1.75z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-tagline text-apple-ink">Builder couldn&apos;t be loaded</h2>
            <p className="mt-2 text-caption text-apple-ink-muted-48">
              Something went wrong while initializing the editor. This is usually
              a temporary glitch — refreshing the page fixes it in most cases.
            </p>

            {this.state.errorInfo && (
              <details className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-left" open>
                <summary className="cursor-pointer text-[11px] font-medium text-red-700">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto text-[10px] text-red-600 whitespace-pre-wrap">
                  {`Store: ${this.state.errorInfo.storeSlug}\n`}
                  {`Time: ${this.state.errorInfo.timestamp}\n`}
                  {`Error: ${this.state.errorInfo.message}\n\n`}
                  {this.state.errorInfo.stack}
                  {`\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
                </pre>
              </details>
            )}

            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ error: null });
                }}
                className="inline-flex items-center gap-2 rounded-apple-pill bg-apple-ink px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85"
              >
                Try Again
              </button>
              {this.props.storeSlug && (
                <Link
                  href={`/store/${this.props.storeSlug}/dashboard`}
                  className="text-caption font-medium text-apple-primary underline underline-offset-4"
                >
                  Back to Store
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
