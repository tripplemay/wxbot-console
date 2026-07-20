'use client';
import { PropsWithChildren } from 'react';
import { isWindowAvailable } from 'utils/navigation';
import FixedPlugin from 'components/fixedPlugin/FixedPlugin';

// Bare auth layout for tenant sign-in/sign-up — mirrors src/app/auth/layout.tsx
// (no sidebar/navbar chrome), so these pages render as full-screen auth cards.
export default function TenantAuthLayout({ children }: PropsWithChildren) {
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';
  return (
    <div>
      <div className="relative float-right h-full min-h-screen w-full dark:!bg-navy-900">
        <main className="mx-auto min-h-screen">
          <FixedPlugin />
          {children}
        </main>
      </div>
    </div>
  );
}
