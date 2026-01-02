import { LucideProps } from 'lucide-react';
import { forwardRef } from 'react';

export const SupabaseIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2.5L2.5 14H11.5L9.5 21.5L21.5 8H13.5L14.5 2.5H12Z" />
  </svg>
));

export const MongoDBIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" />
    <path d="M12 2V22" />
    <path d="M12 22C14.5 19 16 15.5 16 12C16 8.5 14.5 5 12 2" />
  </svg>
));

export const StripeIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 9C16.2 9 18 10.8 18 13C18 15.2 16.2 17 14 17H7" />
    <path d="M10 15C7.8 15 6 13.2 6 11C6 8.8 7.8 7 10 7H17" />
  </svg>
));

export const FirebaseIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3.5 12.5L6.5 6L8.5 13L11.5 4L20.5 20H4L3.5 12.5Z" />
  </svg>
));

export const PostgresIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 10C3 10 5 8 9 8C13 8 16 6 16 6" />
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" />
    <path d="M12 12L15 15" />
    <circle cx="9" cy="9" r="1.5" />
  </svg>
));

export const RedisIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 6H20L18 20H6L4 6Z" />
    <path d="M12 10V16" />
    <path d="M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" />
    <circle cx="12" cy="13" r="1" />
  </svg>
));

export const AWSIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 8L15 15L12 9L8 16L5 10" />
    <path d="M3 19C7 22 17 22 21 19" />
    <path d="M19 18L21 19L20.5 17" />
  </svg>
));

export const VercelIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3L21 20H3L12 3Z" />
  </svg>
));

export const GoogleIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22C17.52 22 22 17.52 22 12C22 11.3 21.93 10.61 21.8 9.95H12V14.05H17.5C17.2 15.5 16.3 16.7 15 17.5L15 20.5H19C21.4 18.2 22.8 14.8 22 11" />
    <path d="M12 2C14.7 2 17.1 2.9 19 4.4L15.3 8.1C14.4 7.5 13.3 7.1 12 7.1C9.1 7.1 6.6 9.1 5.7 11.8L2.7 9.5C4.3 6.3 8 4 12 2" />
    <path d="M2.7 14.5L5.7 12.2C5.5 11.5 5.5 10.8 5.7 10.1L2.7 7.8C1.5 10.2 1.5 13.1 2.7 15.8" />
  </svg>
));
