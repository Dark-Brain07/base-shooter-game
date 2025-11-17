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
    <div className="fixed top-4 right-4 z-50">
      {isConnected && address ? (
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
          <div className="text-white font-medium">{formatAddress(address)}</div>
          <button
            onClick={() => disconnect()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Disconnect"
          >
            <LogOut size={18} className="text-white" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all hover:scale-105"
        >
          <Wallet size={20} />
          Connect Wallet
        </button>
      )}
    </div>
  );
}
