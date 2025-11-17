'use client';

import { useState } from 'react';
import BubbleShooter from '@/components/game/BubbleShooter';
import Leaderboard from '@/components/game/Leaderboard';
import ScoreSubmit from '@/components/game/ScoreSubmit';
import WalletConnect from '@/components/game/WalletConnect';
import { useGameState } from '@/hooks/useGameState';

export default function Home() {
  const [showSubmit, setShowSubmit] = useState(false);
  const { score, gameOver } = useGameState();

  const handleScoreSubmitted = () => {
    setShowSubmit(false);
    // Could trigger leaderboard refresh here
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <WalletConnect />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <BubbleShooter />
            
            {/* Show submit button when game is over */}
            {gameOver && score > 0 && !showSubmit && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowSubmit(true)}
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg transform transition-all hover:scale-105"
                >
                  Submit Score to Blockchain 🏆
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showSubmit ? (
              <ScoreSubmit 
                score={score} 
                onSuccess={handleScoreSubmitted}
              />
            ) : (
              <Leaderboard />
            )}
            
            {/* Game Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <ul className="text-white/80 space-y-2 text-sm">
                <li>🎯 Aim with your mouse/finger</li>
                <li>🔫 Click/tap to shoot bubbles</li>
                <li>💥 Match 3+ bubbles to pop them</li>
                <li>⭐ Higher combos = more points</li>
                <li>🏆 Submit scores to blockchain</li>
                <li>📊 Compete on the leaderboard</li>
              </ul>
            </div>

            {/* Contract Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Contract Info</h3>
              <div className="text-white/80 space-y-2 text-sm break-all">
                <p><strong>Network:</strong> Base Mainnet</p>
                <p><strong>Address:</strong></p>
                <a 
                  href="https://basescan.org/address/0xb516e600522092387439d24376C1dc93A17e1e22"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  0xb516e600522092387439d24376C1dc93A17e1e22
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
