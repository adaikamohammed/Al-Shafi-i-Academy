'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  UserPlus,
  List,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'الصفحة الرئيسية', icon: Home },
  { href: '/register', label: 'تسجيل طالب جديد', icon: UserPlus },
  { href: '/students', label: 'قائمة الطلبة', icon: List },
  { href: '/stats', label: 'الإحصائيات', icon: BarChart3 },
  { href: '/attendance', label: 'حضور الولي', icon: Users },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NavLink = ({
    href,
    label,
    icon: Icon,
    onClick,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary font-headline',
          isActive && 'bg-primary/10 text-primary font-bold'
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  const mobileNav = (
    <nav className="mt-8 flex flex-col gap-2">
      {navLinks.map((link) => (
        <NavLink
          key={link.href}
          {...link}
          onClick={() => setMobileMenuOpen(false)}
        />
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="hidden font-headline text-lg font-bold text-accent sm:inline-block">
            أكاديمية الشافعي
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                className={cn(
                  'font-headline',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <Link href={link.href} className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center justify-between">
                 <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <Logo />
                    <span className="font-headline text-lg font-bold text-accent">
                      أكاديمية الشافعي
                    </span>
                 </Link>
              </div>
              {mobileNav}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
