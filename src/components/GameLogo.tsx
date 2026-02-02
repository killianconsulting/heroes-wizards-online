'use client';

import Image from 'next/image';
import { useState } from 'react';

interface GameLogoProps {
  /** CSS class for the wrapper */
  className?: string;
  /** Max height in pixels for the logo image */
  maxHeight?: number;
}

export default function GameLogo({ className = '', maxHeight = 56 }: GameLogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`game-logo ${className}`}>
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
    </div>
  );
}
