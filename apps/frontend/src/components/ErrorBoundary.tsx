import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }
  render() {
    if (this.state.failed) {
      return <main className="grid min-h-screen place-items-center p-6"><div className="rounded-lg border bg-white p-8 text-center"><h1 className="text-xl font-bold">MCMS needs a refresh</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">A view failed before it could render.</p><Button className="mt-5" onClick={() => location.reload()}>Reload</Button></div></main>;
    }
    return this.props.children;
  }
}
