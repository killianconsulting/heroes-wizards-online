'use client';

import Confetti from './Confetti';

interface WinScreenProps {
  winnerName: string;
  onNewGame: () => void;
}

export default function WinScreen({ winnerName, onNewGame }: WinScreenProps) {
  return (
    <main className="win-screen">
      <Confetti />
      <h1 className="win-screen__title">Victory!</h1>
      <p className="win-screen__message">
        <strong>{winnerName}</strong> has completed the quest and saved the kingdom!
      </p>
      <button type="button" onClick={onNewGame} className="win-screen__btn">
        New game
      </button>
    </main>
  );
}
