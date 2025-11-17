import { create } from 'zustand';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  color: string;
  row: number;
  col: number;
}

interface GameState {
  bubbles: Bubble[];
  currentBubble: Bubble | null;
  nextBubble: Bubble | null;
  score: number;
  gameOver: boolean;
  isPaused: boolean;
  
  setBubbles: (bubbles: Bubble[]) => void;
  setCurrentBubble: (bubble: Bubble | null) => void;
  setNextBubble: (bubble: Bubble | null) => void;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
  togglePause: () => void;
  resetGame: () => void;
}

export const useGameState = create<GameState>((set) => ({
  bubbles: [],
  currentBubble: null,
  nextBubble: null,
  score: 0,
  gameOver: false,
  isPaused: false,
  
  setBubbles: (bubbles) => set({ bubbles }),
  setCurrentBubble: (bubble) => set({ currentBubble: bubble }),
  setNextBubble: (bubble) => set({ nextBubble: bubble }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setGameOver: (over) => set({ gameOver: over }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  resetGame: () => set({ 
    bubbles: [], 
    currentBubble: null, 
    nextBubble: null, 
    score: 0, 
    gameOver: false, 
    isPaused: false 
  }),
}));
