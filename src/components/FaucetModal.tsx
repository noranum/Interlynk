import React, { useState } from 'react';
import { Coins, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { formatITHB, formatTHB } from '../types/token';

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({ isOpen, onClose }) => {
  const { addIthbBalance, ithbBalance } = useWallet();
  const [amount, setAmount] = useState<number>(5000);
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);

  if (!isOpen) return null;

  const handleMint = async () => {
    setIsMinting(true);
    await new Promise((res) => setTimeout(res, 600));
    addIthbBalance(amount);
    setIsMinting(false);
    setMinted(true);
    setTimeout(() => {
      setMinted(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Claim Demo iTHB</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Get fictional Interlynk Thai Baht (iTHB) tokens to test creating and funding escrow agreements.
          </p>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
            <span className="text-slate-500">Current Balance:</span>
            <span className="font-semibold text-slate-900">{formatITHB(ithbBalance)}</span>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Select Faucet Amount</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAmount(5000)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  amount === 5000
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-sm font-bold">5,000 iTHB</div>
                <div className="text-[11px] text-slate-500">≈ ฿5,000</div>
              </button>

              <button
                type="button"
                onClick={() => setAmount(10000)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  amount === 10000
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-sm font-bold">10,000 iTHB</div>
                <div className="text-[11px] text-slate-500">≈ ฿10,000</div>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              iTHB is a test token for the Interlynk prototype and holds no real monetary value.
            </span>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMint}
            disabled={isMinting || minted}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Minting iTHB...</span>
              </>
            ) : minted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Wallet!</span>
              </>
            ) : (
              <>
                <Coins className="w-3.5 h-3.5" />
                <span>Claim {amount.toLocaleString()} iTHB</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
