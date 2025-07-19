import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. You can try refreshing the page or
              going back to the previous screen.
            </p>
            <div className="space-y-2">
              <Button onClick={this.handleReload} className="w-full">
                Reload Page
              </Button>
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
