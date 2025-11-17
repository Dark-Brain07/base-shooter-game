'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { 
  initializeGrid, 
  createBubble, 
  findMatchingBubbles, 
  calculateScore,
  BUBBLE_RADIUS,
  COLS 
} from '@/lib/utils/gameLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [angle, setAngle] = useState(-Math.PI / 2);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 500 });
  const [shootingBubble, setShootingBubble] = useState<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
  } | null>(null);
  
  const {
    bubbles,
    currentBubble,
    nextBubble,
    score,
    gameOver,
    isPaused,
    setBubbles,
    setCurrentBubble,
    setNextBubble,
    addScore,
    setGameOver,
    togglePause,
    resetGame,
  } = useGameState();

  // Responsive canvas sizing
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateSize = () => {
      const width = Math.min(window.innerWidth - 40, COLS * BUBBLE_RADIUS * 2);
      setCanvasSize({ width, height: 500 });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize game
  useEffect(() => {
    const initialBubbles = initializeGrid();
    setBubbles(initialBubbles);
    setCurrentBubble(createBubble(-1, COLS / 2));
    setNextBubble(createBubble(-1, COLS / 2));
  }, [setBubbles, setCurrentBubble, setNextBubble]);

  // Animation loop for shooting bubble
  useEffect(() => {
    if (!shootingBubble || isPaused) return;

    const animate = () => {
      setShootingBubble((prev) => {
        if (!prev) return null;

        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        let newVx = prev.vx;
        let newVy = prev.vy;

        // Wall collision
        if (newX <= BUBBLE_RADIUS || newX >= canvasSize.width - BUBBLE_RADIUS) {
          newVx = -newVx;
          newX = newX <= BUBBLE_RADIUS ? BUBBLE_RADIUS : canvasSize.width - BUBBLE_RADIUS;
        }

        // Check collision with existing bubbles or top
        if (newY <= BUBBLE_RADIUS) {
          // Hit the top
          completeBubbleShot(newX, 0, prev.color);
          return null;
        }

        // Check collision with grid bubbles
        for (const bubble of bubbles) {
          const dx = newX - bubble.x;
          const dy = newY - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < BUBBLE_RADIUS * 2) {
            // Collision detected
            completeBubbleShot(newX, newY, prev.color);
            return null;
          }
        }

        return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shootingBubble, bubbles, isPaused, canvasSize]);

  const completeBubbleShot = (x: number, y: number, color: string) => {
    // Find nearest grid position
    const col = Math.round(x / (BUBBLE_RADIUS * 2));
    const row = Math.round(y / (BUBBLE_RADIUS * 2));
    
    const clampedCol = Math.max(0, Math.min(COLS - 1, col));
    const clampedRow = Math.max(0, Math.min(9, row));

    const newBubble = createBubble(clampedRow, clampedCol, color);
    const updatedBubbles = [...bubbles, newBubble];
    
    // Find matches
    const matches = findMatchingBubbles(updatedBubbles, newBubble);
    
    if (matches.length >= 3) {
      const matchIds = new Set(matches.map(b => b.id));
      const filteredBubbles = updatedBubbles.filter(b => !matchIds.has(b.id));
      setBubbles(filteredBubbles);
      addScore(calculateScore(matches.length));
    } else {
      setBubbles(updatedBubbles);
    }

    // Move next bubble to current
    setCurrentBubble(nextBubble);
    setNextBubble(createBubble(-1, COLS / 2));

    // Check game over
    if (updatedBubbles.some(b => b.row >= 9)) {
      setGameOver(true);
    }
  };

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid bubbles
    bubbles.forEach((bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw shooting bubble
    if (shootingBubble) {
      ctx.beginPath();
      ctx.arc(shootingBubble.x, shootingBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = shootingBubble.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw current bubble (shooter)
    if (currentBubble && !shootingBubble) {
      const shooterX = canvas.width / 2;
      const shooterY = canvas.height - 50;
      
      ctx.beginPath();
      ctx.arc(shooterX, shooterY, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = currentBubble.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw aim line
      ctx.beginPath();
      ctx.moveTo(shooterX, shooterY);
      ctx.lineTo(
        shooterX + Math.cos(angle) * 100,
        shooterY + Math.sin(angle) * 100
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [bubbles, currentBubble, shootingBubble, angle, canvasSize]);

  // Handle aiming
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameOver || isPaused || shootingBubble) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;
    
    const shooterX = canvas.width / 2;
    const shooterY = canvas.height - 50;

    const newAngle = Math.atan2(pointerY - shooterY, pointerX - shooterX);
    
    // Limit angle to upper half (between -170 and -10 degrees)
    const minAngle = -Math.PI * 0.95;
    const maxAngle = -Math.PI * 0.05;
    
    if (newAngle >= minAngle && newAngle <= maxAngle) {
      setAngle(newAngle);
    }
  };

  // Handle shooting
  const handleShoot = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (gameOver || isPaused || !currentBubble || shootingBubble) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const shooterX = canvas.width / 2;
    const shooterY = canvas.height - 50;
    
    const speed = 8;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    setShootingBubble({
      x: shooterX,
      y: shooterY,
      vx,
      vy,
      color: currentBubble.color,
    });
  };

  const handleReset = () => {
    setShootingBubble(null);
    resetGame();
    const initialBubbles = initializeGrid();
    setBubbles(initialBubbles);
    setCurrentBubble(createBubble(-1, COLS / 2));
    setNextBubble(createBubble(-1, COLS / 2));
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl max-w-full">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Base Shooter</h1>
          <div className="text-lg sm:text-xl font-bold text-yellow-400 whitespace-nowrap shrink-0">
            Score: {score}
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="bg-black/20 rounded-lg touch-none"
            style={{ cursor: 'crosshair', maxWidth: '100%', height: 'auto' }}
            onPointerMove={handlePointerMove}
            onPointerDown={handleShoot}
          />
        </div>

        <div className="flex gap-2 sm:gap-4 mt-4 justify-center flex-wrap">
          <button
            onClick={togglePause}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        {nextBubble && (
          <div className="mt-4 text-center">
            <p className="text-white mb-2 text-sm sm:text-base">Next Bubble:</p>
            <div 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mx-auto border-2 border-white"
              style={{ backgroundColor: nextBubble.color }}
            />
          </div>
        )}

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl"
            >
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center mx-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
                <p className="text-lg sm:text-xl text-gray-600 mb-6">Final Score: {score}</p>
                <button
                  onClick={handleReset}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg font-semibold touch-manipulation"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
