
import Link from 'next/link';
import NavItem from './NavItem';
import { ListOrdered, Users, Soup, GlassWater } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
          錦町地域交流会会計アプリ
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <NavItem href="/tabs" icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}>
            お客さん
          </NavItem>
          <NavItem href="/kitchen" icon={<Soup className="h-4 w-4 sm:h-5 sm:w-5" />}>
            キッチン
          </NavItem>
          <NavItem href="/beverages" icon={<GlassWater className="h-4 w-4 sm:h-5 sm:w-5" />}>
            飲み物登録
          </NavItem>
        </nav>
      </div>
    </header>
  );
}
