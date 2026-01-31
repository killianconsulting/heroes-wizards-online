'use client';

import Card from './Card';
import type { Party as PartyType } from '@/engine/state';

const SLOTS: { key: keyof PartyType; label: string }[] = [
  { key: 'wizard', label: 'Wizard' },
  { key: 'knight', label: 'Knight' },
  { key: 'archer', label: 'Archer' },
  { key: 'barbarian', label: 'Barbarian' },
  { key: 'thief', label: 'Thief' },
];

interface PartyProps {
  party: PartyType;
  playerName: string;
  /** If true, this is the current player */
  isCurrent?: boolean;
}

export default function PartyDisplay({ party, playerName, isCurrent }: PartyProps) {
  return (
    <div className={`party ${isCurrent ? 'party--current' : ''}`}>
      <h3 className="party__title">{playerName}&apos;s Party</h3>
      <div className="party__slots">
        {SLOTS.map(({ key, label }) => (
          <div key={key} className="party__slot">
            <span className="party__slot-label">{label}</span>
            {party[key] !== null ? (
              <Card cardId={party[key]!} className="party__card" />
            ) : (
              <div className="party__empty" aria-label={`Empty ${label} slot`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
