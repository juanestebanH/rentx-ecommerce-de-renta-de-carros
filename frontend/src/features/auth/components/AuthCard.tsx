import type { ReactNode } from 'react';
import { CarFront } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md gap-4 border-transparent bg-card shadow-[0_16px_48px_-12px_rgba(43,36,30,0.22)]">
      <CardHeader className="gap-1 text-center">
        <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
          <CarFront className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="text-2xl tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="mx-auto max-w-xs leading-relaxed">
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}