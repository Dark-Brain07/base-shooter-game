'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SCORE_CONTRACT_ADDRESS, SCORE_CONTRACT_ABI } from '@/lib/contracts/scoreContract';
import { Trophy, Loader2 } from 'lucide-react';

interface ScoreSubmitProps {
  score: number;
  onSuccess?: () => void;
}

export default function ScoreSubmit({ score, onSuccess }: ScoreSubmitProps) {
  const { address, isConnected } = useAccount();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first!');
      return;
    }

    if (score === 0) {
      alert('Score must be greater than 0!');
      return;
    }

    if (!username.trim()) {
      alert('Please enter a username!');
      return;
    }

    try {
      setIsSubmitting(true);
      
      writeContract({
        address: SCORE_CONTRACT_ADDRESS,
        abi: SCORE_CONTRACT_ABI,
        functionName: 'submitScore',
        args: [BigInt(score), username.trim()],
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle success
  if (isSuccess) {
    setTimeout(() => {
      setIsSubmitting(false);
      setUsername('');
      onSuccess?.();
    }, 2000);
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="text-yellow-400" size={32} />
        <h2 className="text-2xl font-bold text-white">Submit Score</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2 font-medium">Your Score</label>
          <div className="text-4xl font-bold text-yellow-400">{score}</div>
        </div>

        <div>
          <label className="block text-white mb-2 font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            maxLength={32}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting || isConfirming}
          />
        </div>

        {!isConnected && (
          <p className="text-yellow-400 text-sm">
            ⚠️ Please connect your wallet to submit your score
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isConnected || isSubmitting || isConfirming || !username.trim()}
          className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          {isConfirming ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Confirming...
            </>
          ) : isSuccess ? (
            <>
              ✓ Score Submitted!
            </>
          ) : (
            <>
              <Trophy size={20} />
              Submit to Blockchain
            </>
          )}
        </button>

        {hash && (
          <p className="text-xs text-white/60 text-center">
            Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
          </p>
        )}
      </div>
    </div>
  );
}
