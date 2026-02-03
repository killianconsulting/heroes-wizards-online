'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface LeaveGameContextValue {
  inGame: boolean;
  onLeaveGame: () => void;
  registerLeaveGame: (inGame: boolean, onLeaveGame: () => void) => void;
  requestLeaveGame: () => void;
  /** Register a callback to run when user wants to go to start screen (e.g. footer link). */
  registerGoToStart: (callback: () => void) => void;
  /** Call the registered go-to-start callback (clears lobby/view and navigates home). */
  goToStartScreen: () => void;
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
      registerGoToStart: () => {},
      goToStartScreen: () => {},
    };
  }
  return ctx;
}

export function LeaveGameProvider({ children }: { children: React.ReactNode }) {
  const [inGame, setInGame] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const onLeaveGameRef = useRef<() => void>(() => {});
  const goToStartCallbackRef = useRef<() => void>(() => {});

  const registerLeaveGame = useCallback((inGameVal: boolean, onLeave: () => void) => {
    onLeaveGameRef.current = onLeave;
    setInGame(inGameVal);
  }, []);

  const registerGoToStart = useCallback((callback: () => void) => {
    goToStartCallbackRef.current = callback;
  }, []);

  const goToStartScreen = useCallback(() => {
    goToStartCallbackRef.current();
  }, []);

  const requestLeaveGame = useCallback(() => {
    if (inGame) setShowModal(true);
  }, [inGame]);

  const handleConfirm = useCallback(() => {
    setShowModal(false);
    onLeaveGameRef.current();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const value = useMemo(
    () => ({
      inGame,
      onLeaveGame: () => onLeaveGameRef.current(),
      registerLeaveGame,
      requestLeaveGame,
      registerGoToStart,
      goToStartScreen,
    }),
    [inGame, registerLeaveGame, requestLeaveGame, registerGoToStart, goToStartScreen]
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
