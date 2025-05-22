import type { ReactNode } from 'react';
import Header from './Header';
import { Toaster } from '@/components/ui/toaster';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
