'use client';

import Image from 'next/image';
import { useState } from 'react';

interface GameLogoProps {
  /** CSS class for the wrapper */
  className?: string;
  /** Max height in pixels for the logo image */
  maxHeight?: number;
  /** When set, the logo is clickable and navigates back to start (same as Change Mode) */
  onClick?: () => void;
}

export default function GameLogo({ className = '', maxHeight = 56, onClick }: GameLogoProps) {
  const [imageError, setImageError] = useState(false);

  const content = (
    <>
      {!imageError ? (
        <Image
          src="/images/hw_logo.png"
          alt="Heroes & Wizards"
          width={280}
          height={maxHeight}
          className="game-logo__img"
          style={{ maxHeight, width: 'auto', objectFit: 'contain' }}
          unoptimized
          onError={() => setImageError(true)}
        />
      ) : null}
      {imageError ? (
        <span className="game-logo__fallback">Heroes & Wizards</span>
      ) : null}
    </>
  );

  const wrapperClass = `game-logo ${onClick ? 'game-logo--clickable' : ''} ${className}`.trim();

  if (onClick) {
    return (
      <button
        type="button"
        className={wrapperClass}
        onClick={onClick}
        aria-label="Back to start"
      >
        {content}
      </button>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
