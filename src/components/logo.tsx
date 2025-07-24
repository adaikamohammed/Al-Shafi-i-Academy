import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-10 w-auto text-primary', className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="School Logo"
    >
      <path
        d="M60 110C87.6142 110 110 87.6142 110 60C110 32.3858 87.6142 10 60 10C32.3858 10 10 32.3858 10 60C10 87.6142 32.3858 110 60 110Z"
        stroke="hsl(var(--accent))"
        strokeWidth="8"
      />
      <path
        d="M44.7 90C44.7 84.7 40.2 80.2 35 80.2C29.8 80.2 25.3 84.7 25.3 90C25.3 95.3 29.8 99.8 35 99.8C35.7 99.8 36.3 99.7 37 99.5L44.7 90Z"
        fill="currentColor"
      />
      <path
        d="M65.4 90C65.4 84.7 60.9 80.2 55.7 80.2C50.5 80.2 46 84.7 46 90C46 95.3 50.5 99.8 55.7 99.8C56.4 99.8 57 99.7 57.7 99.5L65.4 90Z"
        fill="currentColor"
      />
      <path
        d="M86.1 90C86.1 84.7 81.6 80.2 76.4 80.2C71.2 80.2 66.7 84.7 66.7 90C66.7 95.3 71.2 99.8 76.4 99.8C77.1 99.8 77.7 99.7 78.4 99.5L86.1 90Z"
        fill="currentColor"
      />
      <path
        d="M93.3 58.6C91 43.1 76.8 31.4 60.3 31.4C43.8 31.4 30.2 42.1 27.2 56.6C26.9 58.1 25.6 59.2 24.1 59.2H21V53C21 34.2 38.7 19.4 58.5 20.1C79.8 20.9 97 39.2 97 60.7V61.1C97 61.2 97 61.4 97 61.5C96.9 60.2 95.5 58.9 94 58.7L93.3 58.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
