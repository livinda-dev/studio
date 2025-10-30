'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

const navItems = [
  { href: '/chat', label: 'AI Chat' },
  { href: '/activity', label: 'Activity' },
  { href: '/weather', label: 'Weather' },
  { href: '/profile', label: 'Profile' },
];

export default function TopNavbar() {
  const pathname = usePathname();

  return (
    <header className="hidden md:block border-b bg-card shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto flex items-center h-16">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <Bot className="h-7 w-7 text-primary" />
                <span className="font-bold text-lg font-headline">HealthWise</span>
            </Link>
        </div>
        <div className="flex-1 flex items-center justify-center gap-4 lg:gap-8">
            {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
                    isActive && "text-primary"
                )}
                >
                {item.label}
                </Link>
            );
            })}
        </div>
        <div className='w-[140px]'></div>
      </nav>
    </header>
  );
}
