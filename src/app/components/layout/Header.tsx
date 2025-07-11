
import Link from 'next/link';
import NavItem from './NavItem';
import { Users, Martini, GlassWater, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
          錦町地域交流会会計アプリ
        </Link>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <NavItem href="/customers" icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}>
            お客さん
          </NavItem>
          <NavItem href="/kitchen" icon={<Martini className="h-4 w-4 sm:h-5 sm:w-5" />}>
            バー
          </NavItem>
          <NavItem href="/menu" icon={<GlassWater className="h-4 w-4 sm:h-5 sm:w-5" />}>
            飲み物管理
          </NavItem>
          <NavItem href="/admin" icon={<Settings className="h-4 w-4 sm:h-5 sm:w-5" />}>
            管理
          </NavItem>
        </nav>
      </div>
    </header>
  );
}
