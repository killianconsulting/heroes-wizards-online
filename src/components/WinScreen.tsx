'use client';

import Confetti from './Confetti';

interface WinScreenProps {
  /** Winner name when someone won (quest completed or opponent left). */
  winnerName?: string | null;
  /** When true, show "A player left" message instead of victory. */
  playerLeft?: boolean;
  onNewGame: () => void;
}

export default function WinScreen({ winnerName, playerLeft: isPlayerLeft, onNewGame }: WinScreenProps) {
  return (
    <main className="win-screen">
      {!isPlayerLeft && <Confetti />}
      <h1 className="win-screen__title">
        {isPlayerLeft ? 'Game over' : 'Victory!'}
      </h1>
      <p className="win-screen__message">
        {isPlayerLeft ? (
          <>A player left the game.</>
        ) : (
          <>
            <strong>{winnerName ?? 'Unknown'}</strong> has completed the quest and saved the kingdom!
          </>
        )}
      </p>
      <button type="button" onClick={onNewGame} className="win-screen__btn">
        New Game
      </button>
    </main>
  );
}
