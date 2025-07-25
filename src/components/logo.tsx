import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-12 w-auto', className)}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="School Logo"
    >
        <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: 'hsl(var(--primary-foreground))', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        {/* Book */}
        <path d="M10 70 Q50 50, 90 70 L95 75 L5 75 Z" fill="url(#goldGradient)" />
        <path d="M50 5 L95 40 L5 40 Z" fill="hsl(var(--accent))" stroke="url(#goldGradient)" strokeWidth="1.5" />
        <path d="M50 15 L85 40 L15 40 Z" fill="hsl(var(--background))" />
        <path d="M50 20 L75 40 L25 40 Z" fill="hsl(var(--accent))" />

    </svg>
  );
}
