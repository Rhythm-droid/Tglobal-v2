"use client";

import { Component, type ReactNode } from "react";

/* Per-tile error boundary so a single broken Componentry component
   doesn't kill the entire preview page. Renders a small "needs
   props" placeholder in place of the crashed tile. Class component
   because React error boundaries can't be hooks. */
interface State {
  hasError: boolean;
  message?: string;
}

interface Props {
  children: ReactNode;
}

export default class ErrorTile extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/45"
            style={{ fontFamily: "var(--font-mono), monospace" }}
          >
            needs specific props
          </span>
          <span className="line-clamp-2 text-[11px] text-foreground/55">
            {this.state.message}
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}
