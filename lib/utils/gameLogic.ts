import { Bubble } from '@/hooks/useGameState';

export const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
export const BUBBLE_RADIUS = 20;
export const ROWS = 10;
export const COLS = 8;

export function generateRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function createBubble(row: number, col: number, color?: string): Bubble {
  return {
    id: `${row}-${col}-${Date.now()}`,
    x: col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
    y: row * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
    color: color || generateRandomColor(),
    row,
    col,
  };
}

export function initializeGrid(): Bubble[] {
  const bubbles: Bubble[] = [];
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < COLS; col++) {
      if (Math.random() > 0.2) {
        bubbles.push(createBubble(row, col));
      }
    }
  }
  
  return bubbles;
}

export function findMatchingBubbles(
  bubbles: Bubble[],
  targetBubble: Bubble
): Bubble[] {
  const matches: Bubble[] = [targetBubble];
  const checked = new Set<string>([targetBubble.id]);
  const queue = [targetBubble];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(bubbles, current);

    for (const neighbor of neighbors) {
      if (!checked.has(neighbor.id) && neighbor.color === targetBubble.color) {
        checked.add(neighbor.id);
        matches.push(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return matches;
}

export function getNeighbors(bubbles: Bubble[], bubble: Bubble): Bubble[] {
  const neighbors: Bubble[] = [];
  const { row, col } = bubble;

  const positions = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
    { row: row - 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
  ];

  for (const pos of positions) {
    const neighbor = bubbles.find((b) => b.row === pos.row && b.col === pos.col);
    if (neighbor) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

export function calculateScore(matchCount: number): number {
  if (matchCount < 3) return 0;
  return matchCount * 10 + (matchCount - 3) * 5;
}
