'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLeaveGame } from '@/context/LeaveGameContext';

export default function Footer() {
  const [dividerLoaded, setDividerLoaded] = useState(false);
  const [dividerError, setDividerError] = useState(false);
  const { inGame, requestLeaveGame } = useLeaveGame();

  const handleStartScreenClick = (e: React.MouseEvent) => {
    if (inGame) {
      e.preventDefault();
      requestLeaveGame();
    }
    // If not in game, Link will navigate to /
  };

  return (
    <footer className="site-footer">
      {!dividerError && (
        <div className="site-footer__divider-wrap">
          <img
            src="/images/hw_horizontal_divider.png"
            alt=""
            className="site-footer__divider"
            onError={() => setDividerError(true)}
          />
        </div>
      )}
      <div className="site-footer__inner">
        <nav className="site-footer__nav" aria-label="Footer navigation">
          <Link
            href="/"
            className="site-footer__link"
            onClick={handleStartScreenClick}
          >
            Start Screen
          </Link>
          <Link href="/how-to-play" className="site-footer__link">
            How to Play
          </Link>
          <Link href="/disclaimer" className="site-footer__link">
            Disclaimer
          </Link>
        </nav>
        <p className="site-footer__credit">
          Heroes & Wizards is a fan-made, non-commercial project. Not affiliated with the original creators.
        </p>
        <p className="site-footer__publisher">
          Official game:{' '}
          <a
            href="https://jofgames.com.au/heroes-and-wizards/"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__publisher-link"
          >
            Jof Games — Heroes & Wizards
          </a>
        </p>
        <p className="site-footer__issues">
          Found a bug or want to leave a comment? Report bugs on the{' '}
          <a
            href="https://github.com/killianconsulting/heroes_wizards/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__link"
          >
            Issues page
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
