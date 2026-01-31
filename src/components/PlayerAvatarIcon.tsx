'use client';

/** Small avatar icon (wizard/hero silhouette) for player name rows. */
export default function PlayerAvatarIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      {/* Simple figure: head + body (fantasy silhouette) */}
      <circle cx="12" cy="6" r="3.5" />
      <path d="M12 10c-3.5 0-6 2-6 5v2h12v-2c0-3-2.5-5-6-5z" />
      {/* Small peak/cap hint */}
      <path d="M12 2.5L14 5h-4L12 2.5z" opacity="0.8" />
    </svg>
  );
}
