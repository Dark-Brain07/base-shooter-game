'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet, LogOut } from 'lucide-react';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="w-full flex justify-center pb-4">
      {isConnected && address ? (
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
          <Wallet size={16} className="text-blue-400" />
          <div className="text-white font-medium text-sm">{formatAddress(address)}</div>
          <button
            onClick={() => disconnect()}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Disconnect"
          >
            <LogOut size={14} className="text-white" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all text-sm transform hover:scale-105"
        >
          <Wallet size={18} />
          Connect Wallet
        </button>
      )}
    </div>
  );
}
