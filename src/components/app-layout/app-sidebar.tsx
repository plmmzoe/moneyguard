'use client';

import { LayoutDashboard, Search, Clock3, LineChart, Flag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Quick Check', href: '/analyze', icon: Search },
  { label: 'History', href: '/history', icon: Clock3 },
  { label: 'Insight', href: '/analysis', icon: LineChart },
  { label: 'Goals', href: '/savings', icon: Flag },
  { label: 'Profile', href: '/profile', icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <nav className="rounded-xl bg-card border border-border p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2 border-l-2 py-2 pl-3 pr-3 rounded-r-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden border-b border-border bg-card/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
