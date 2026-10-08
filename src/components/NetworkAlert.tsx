import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const NetworkAlert: React.FC = () => {
  const { isConnected, isSepolia, switchNetwork, error } = useWallet();

  if (!isConnected || isSepolia) {
    if (error) {
      return (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-3 text-amber-900 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Wrong Network Detected:</strong> Please switch to Sepolia to use Interlynk.
          </span>
        </div>
        <button
          onClick={() => switchNetwork()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span>Switch to Sepolia</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
