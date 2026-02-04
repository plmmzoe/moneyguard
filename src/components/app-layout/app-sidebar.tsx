'use client';

import { LayoutDashboard, Search, Clock3, LineChart, Flag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Quick Check', href: '/analyze', icon: Search },
  { label: 'History', href: '/history', icon: Clock3 },
  { label: 'Insight', href: '/analysis', icon: LineChart },
  { label: 'Goals', href: '/onboarding', icon: Flag },
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
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-primary/5'
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
