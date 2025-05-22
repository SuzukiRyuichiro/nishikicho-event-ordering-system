import Link from 'next/link';
import NavItem from './NavItem';
import { ListOrdered, Users, Soup } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
          Nishikicho Event App
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <NavItem href="/tabs" icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}>
            Tabs
          </NavItem>
          <NavItem href="/kitchen" icon={<Soup className="h-4 w-4 sm:h-5 sm:w-5" />}>
            Kitchen
          </NavItem>
        </nav>
      </div>
    </header>
  );
}
