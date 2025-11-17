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
import { Pause, Play, RotateCcw, Target } from 'lucide-react';

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [angle, setAngle] = useState(-Math.PI / 2);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 500 });
  const [isMobile, setIsMobile] = useState(false);
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

  // Detect mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

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
          completeBubbleShot(newX, 0, prev.color);
          return null;
        }

        // Check collision with grid bubbles
        for (const bubble of bubbles) {
          const dx = newX - bubble.x;
          const dy = newY - bubble.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < BUBBLE_RADIUS * 2) {
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
    const col = Math.round(x / (BUBBLE_RADIUS * 2));
    const row = Math.round(y / (BUBBLE_RADIUS * 2));
    
    const clampedCol = Math.max(0, Math.min(COLS - 1, col));
    const clampedRow = Math.max(0, Math.min(9, row));

    const newBubble = createBubble(clampedRow, clampedCol, color);
    const updatedBubbles = [...bubbles, newBubble];
    
    const matches = findMatchingBubbles(updatedBubbles, newBubble);
    
    if (matches.length >= 3) {
      const matchIds = new Set(matches.map(b => b.id));
      const filteredBubbles = updatedBubbles.filter(b => !matchIds.has(b.id));
      setBubbles(filteredBubbles);
      addScore(calculateScore(matches.length));
    } else {
      setBubbles(updatedBubbles);
    }

    setCurrentBubble(nextBubble);
    setNextBubble(createBubble(-1, COLS / 2));

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid bubbles with glow effect
    bubbles.forEach((bubble) => {
      // Glow effect
      ctx.shadowColor = bubble.color;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    });

    // Draw shooting bubble
    if (shootingBubble) {
      ctx.shadowColor = shootingBubble.color;
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.arc(shootingBubble.x, shootingBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = shootingBubble.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
    }

    // Draw current bubble (shooter)
    if (currentBubble && !shootingBubble) {
      const shooterX = canvas.width / 2;
      const shooterY = canvas.height - 50;
      
      ctx.shadowColor = currentBubble.color;
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.arc(shooterX, shooterY, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = currentBubble.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.shadowBlur = 0;

      // Draw aim line (longer and more visible)
      ctx.beginPath();
      ctx.moveTo(shooterX, shooterY);
      const aimLength = 150;
      ctx.lineTo(
        shooterX + Math.cos(angle) * aimLength,
        shooterY + Math.sin(angle) * aimLength
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw aim target circle
      const targetX = shooterX + Math.cos(angle) * aimLength;
      const targetY = shooterY + Math.sin(angle) * aimLength;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [bubbles, currentBubble, shootingBubble, angle, canvasSize]);

  // Handle aiming - works on both mobile and desktop
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
    
    const minAngle = -Math.PI * 0.95;
    const maxAngle = -Math.PI * 0.05;
    
    if (newAngle >= minAngle && newAngle <= maxAngle) {
      setAngle(newAngle);
    }
  };

  // Desktop click to shoot
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMobile) return; // Don't shoot on mobile click
    handleShootAction();
  };

  // Shoot action
  const handleShootAction = () => {
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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl max-w-full w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-white">Base Shooter</h1>
          <div className="text-lg sm:text-xl font-bold text-yellow-400">
            Score: {score}
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="bg-gradient-to-b from-black/30 to-black/50 rounded-lg touch-none border-2 border-white/20"
            style={{ cursor: isMobile ? 'default' : 'crosshair', maxWidth: '100%', height: 'auto' }}
            onPointerMove={handlePointerMove}
            onClick={handleCanvasClick}
          />
          
          {/* Mobile Instructions */}
          {isMobile && !shootingBubble && (
            <div className="mt-2 text-center text-white/80 text-sm">
              👆 Touch canvas to aim, then tap SHOOT button
            </div>
          )}
        </div>

        {/* Mobile Shoot Button */}
        {isMobile && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleShootAction}
              disabled={gameOver || isPaused || !currentBubble || shootingBubble}
              className="px-12 py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xl touch-manipulation shadow-lg flex items-center gap-3 transform active:scale-95 transition-all"
            >
              <Target size={24} />
              SHOOT
            </button>
          </div>
        )}

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
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto border-3 border-white shadow-lg"
              style={{ 
                backgroundColor: nextBubble.color,
                boxShadow: `0 0 20px ${nextBubble.color}`
              }}
            />
          </div>
        )}

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md rounded-2xl z-50"
            >
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 sm:p-8 text-center mx-4 shadow-2xl border-2 border-white/20">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Game Over!</h2>
                <p className="text-lg sm:text-xl text-white/90 mb-6">Final Score: <span className="text-yellow-300 font-bold">{score}</span></p>
                <button
                  onClick={handleReset}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg font-semibold touch-manipulation shadow-lg transform hover:scale-105 transition-all"
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
