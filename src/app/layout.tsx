import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'المدرسة القرآنية للإمام الشافعي',
  description: 'موقع المدرسة القرآنية للإمام الشافعي – تقسيم الوادي',
};

function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
             <div className="flex h-screen w-full items-center justify-center">
                <div className="text-2xl font-headline">جار التحميل...</div>
            </div>
        );
    }
    
    const showHeader = !!user;

    return (
        <div className="relative flex min-h-screen flex-col">
            {showHeader && <Header />}
            <main className="flex-1">{children}</main>
        </div>
    )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Lateef:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          'font-body'
        )}
      >
        <AuthProvider>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
