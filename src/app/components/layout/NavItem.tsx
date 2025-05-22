'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function NavItem({ href, icon, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      className={cn(
        "flex items-center gap-2 transition-all",
        isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Link href={href}>
        {icon}
        <span className="hidden sm:inline">{children}</span>
      </Link>
    </Button>
  );
}
