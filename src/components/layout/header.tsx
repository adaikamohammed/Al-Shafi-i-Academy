
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  List,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  PlusCircle,
  CalendarDays,
  LogOut,
  Upload,
  FileText,
  Users2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '@/context/auth-context';

const navLinks = [
  { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/register', label: 'تسجيل طالب جديد', icon: UserPlus },
  { href: '/students', label: 'قائمة الطلبة', icon: List },
  { href: '/import', label: 'استيراد طلبة', icon: Upload },
  { href: '/stats', label: 'الإحصائيات', icon: BarChart3 },
  { href: '/reports', label: 'التقارير', icon: FileText },
  { href: '/cohorts', label: 'تكوين أفواج', icon: Users2 },
  { href: '/attendance', label: 'حضور الولي', icon: Users },
  { href: '/points', label: 'نقاط الحضور', icon: PlusCircle },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];

export function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    // Set date only on client-side to avoid hydration mismatch
    setCurrentDate(format(new Date(), 'eeee, d MMMM yyyy', { locale: ar }));
  }, []);

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
        <Button onClick={handleLogout} variant="ghost" className="justify-start mt-4 font-headline flex items-center gap-3 rounded-md px-3 py-2 text-destructive hover:text-destructive">
            <LogOut className="h-5 w-5"/>
            تسجيل الخروج
        </Button>
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-lg font-bold text-accent sm:inline-block">
                الإمام الشافعي
            </span>
            </Link>
            {currentDate && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <CalendarDays className="h-4 w-4" />
                    <span>{currentDate}</span>
                </div>
            )}
        </div>


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
           <Button onClick={handleLogout} variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="تسجيل الخروج">
              <LogOut className="h-5 w-5"/>
           </Button>
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
                    <span className="font-headline text-lg font-bold text-accent">
                      الإمام الشافعي
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
