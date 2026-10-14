import type { ReactNode } from 'react';

interface SectionHeadingProps {
  icon: ReactNode;
  children: ReactNode;
}

export function SectionHeading({ icon, children }: SectionHeadingProps) {
  return (
    <h2 className="my-0 flex items-center gap-2 text-base font-semibold tracking-tight sm:col-span-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
        {icon}
      </span>
      {children}
    </h2>
  );
}