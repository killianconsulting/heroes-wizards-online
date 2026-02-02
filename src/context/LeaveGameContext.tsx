'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface LeaveGameContextValue {
  inGame: boolean;
  onLeaveGame: () => void;
  registerLeaveGame: (inGame: boolean, onLeaveGame: () => void) => void;
  requestLeaveGame: () => void;
}

const LeaveGameContext = createContext<LeaveGameContextValue | null>(null);

export function useLeaveGame() {
  const ctx = useContext(LeaveGameContext);
  if (!ctx) {
    return {
      inGame: false,
      onLeaveGame: () => {},
      registerLeaveGame: () => {},
      requestLeaveGame: () => {},
    };
  }
  return ctx;
}

export function LeaveGameProvider({ children }: { children: React.ReactNode }) {
  const [inGame, setInGame] = useState(false);
  const [onLeaveGame, setOnLeaveGame] = useState<() => void>(() => () => {});
  const [showModal, setShowModal] = useState(false);

  const registerLeaveGame = useCallback((inGameVal: boolean, onLeave: () => void) => {
    setInGame(inGameVal);
    setOnLeaveGame(() => onLeave);
  }, []);

  const requestLeaveGame = useCallback(() => {
    if (inGame) setShowModal(true);
  }, [inGame]);

  const handleConfirm = useCallback(() => {
    setShowModal(false);
    onLeaveGame();
  }, [onLeaveGame]);

  useEffect(() => {
    if (!showModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const value = useMemo(
    () => ({ inGame, onLeaveGame, registerLeaveGame, requestLeaveGame }),
    [inGame, onLeaveGame, registerLeaveGame, requestLeaveGame]
  );

  return (
    <LeaveGameContext.Provider value={value}>
      {children}
      {showModal && (
        <div
          className="leave-game-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-game-title"
          onClick={() => setShowModal(false)}
        >
          <div
            className="leave-game-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="leave-game-title" className="leave-game-modal__title">
              Leave game?
            </h2>
            <p className="leave-game-modal__message">
              Are you sure you want to leave? Your progress will be lost.
            </p>
            <div className="leave-game-modal__actions">
              <button
                type="button"
                className="leave-game-modal__btn leave-game-modal__btn--cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="leave-game-modal__btn leave-game-modal__btn--confirm"
                onClick={handleConfirm}
              >
                Leave game
              </button>
            </div>
          </div>
        </div>
      )}
    </LeaveGameContext.Provider>
  );
}
