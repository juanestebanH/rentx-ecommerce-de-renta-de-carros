import { Component, Fragment, type ReactNode } from 'react';
import { Html } from '@react-three/drei';

interface ModelBoundaryProps {
  children: ReactNode;
}

interface ModelBoundaryState {
  hasError: boolean;
  attempt: number;
}

export class ModelBoundary extends Component<
  ModelBoundaryProps,
  ModelBoundaryState
> {
  state: ModelBoundaryState = { hasError: false, attempt: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  private handleRetry = () => {
    this.setState((state) => ({
      hasError: false,
      attempt: state.attempt + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/90 px-5 py-4 text-center shadow-md backdrop-blur-md">
            <p className="my-0 text-sm font-semibold text-foreground">
              Modelo 3D no disponible
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              Reintentar
            </button>
          </div>
        </Html>
      );
    }
    return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>;
  }
}