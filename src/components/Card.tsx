'use client';

import Image from 'next/image';
import { getCard } from '@/data/cards';

interface CardProps {
  cardId: number;
  /** Show face-down (e.g. deck back) */
  faceDown?: boolean;
  /** Highlight as playable / selected */
  highlight?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
}

const CARD_BACK = '/cards/heroes_wizards_card_back.png';

export default function Card({
  cardId,
  faceDown = false,
  highlight = false,
  onClick,
  onDoubleClick,
  className = '',
}: CardProps) {
  const card = getCard(cardId);
  const showBack = faceDown;
  const hasImage = !showBack && card.image;
  const alt = faceDown ? 'Card back' : card.name;

  return (
    <button
      type="button"
      className={`card ${highlight ? 'card--highlight' : ''} ${onClick || onDoubleClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      disabled={!onClick && !onDoubleClick}
      aria-label={alt}
    >
      {hasImage ? (
        <Image
          src={card.image!}
          alt={alt}
          width={120}
          height={168}
          unoptimized
          className="card__img"
        />
      ) : showBack ? (
        <Image
          src={CARD_BACK}
          alt={alt}
          width={120}
          height={168}
          unoptimized
          className="card__img"
        />
      ) : (
        <div className="card__placeholder" title={alt}>
          <span className="card__placeholder-name">{card.name}</span>
          <span className="card__placeholder-type">{card.type}</span>
        </div>
      )}
    </button>
  );
}
