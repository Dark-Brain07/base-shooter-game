'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { SCORE_CONTRACT_ADDRESS, SCORE_CONTRACT_ABI } from '@/lib/contracts/scoreContract';
import { Trophy, User, Clock } from 'lucide-react';

interface ScoreEntry {
  player: string;
  score: bigint;
  timestamp: bigint;
  username: string;
}

export default function Leaderboard() {
  const { address } = useAccount();
  const [topScores, setTopScores] = useState<ScoreEntry[]>([]);

  const { data: scoresData, refetch } = useReadContract({
    address: SCORE_CONTRACT_ADDRESS,
    abi: SCORE_CONTRACT_ABI,
    functionName: 'getTopScores',
    args: [10n], // Get top 10 scores
  });

  useEffect(() => {
    if (scoresData) {
      setTopScores(scoresData as ScoreEntry[]);
    }
  }, [scoresData]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-yellow-400" size={32} />
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Leaderboard</h2>
      </div>

      <div className="space-y-2">
        {topScores.length === 0 ? (
          <p className="text-white/60 text-center py-8">No scores yet. Be the first!</p>
        ) : (
          topScores.map((entry, index) => (
            <div
              key={`${entry.player}-${index}`}
              className={`flex items-center justify-between p-4 rounded-lg ${
                entry.player.toLowerCase() === address?.toLowerCase()
                  ? 'bg-blue-500/30 border-2 border-blue-400'
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? 'bg-yellow-400 text-yellow-900'
                      : index === 1
                      ? 'bg-gray-300 text-gray-800'
                      : index === 2
                      ? 'bg-orange-400 text-orange-900'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-white/60" />
                    <span className="text-white font-medium">
                      {entry.username || formatAddress(entry.player)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Clock size={14} />
                    <span>{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
              </div>

              <div className="text-2xl font-bold text-yellow-400">
                {entry.score.toString()}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => refetch()}
        className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}
