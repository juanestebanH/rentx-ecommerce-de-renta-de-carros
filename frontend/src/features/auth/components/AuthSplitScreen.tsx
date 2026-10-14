import type { ReactNode } from 'react';
import { AuthVisualPanel } from './AuthVisualPanel';

interface AuthSplitScreenProps {
  children: ReactNode;
}

export function AuthSplitScreen({ children }: AuthSplitScreenProps) {
  return (
    <div className="flex w-full flex-col md:grid md:grid-cols-2 md:flex-1 md:overflow-hidden">
      <AuthVisualPanel />
      <div className="flex w-full flex-col items-center px-4 py-6 md:overflow-y-auto md:py-0 lg:px-8">
        <div className="my-auto flex w-full flex-col items-center py-5 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}