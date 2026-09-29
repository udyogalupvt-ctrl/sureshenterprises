import { useId } from 'react';

/** Placeholder brand mark: a rising line on an emerald tile. */
export default function Logo({ className = 'size-9' }) {
  const gradientId = useId();

  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
      <path
        d="M10 26.5l6.5-6.5 4.5 4.5L30 15.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="15.5" r="2.5" fill="#fff" />
    </svg>
  );
}
