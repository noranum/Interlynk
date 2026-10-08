import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Copy, Check, ArrowRight } from 'lucide-react';
import { formatITHB, formatTHB } from '../types/token';
import { shortenAddress, getEtherscanTxUrl } from '../services/blockchain';
import { StatusBadge } from './StatusBadge';

interface ReleaseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  recipientAddress: string;
  txHash: string;
}

export const ReleaseSuccessModal: React.FC<ReleaseSuccessModalProps> = ({
  isOpen,
  onClose,
  amount,
  recipientAddress,
  txHash,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all text-center">
        {/* Celebration header */}
        <div className="pt-8 pb-4 px-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Payment Released Successfully</h3>
          <p className="text-sm text-slate-500 mt-1">
            Funds have been unlocked and transferred on the Ethereum Sepolia network.
          </p>
        </div>

        {/* Transaction Card */}
        <div className="px-6 py-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-left text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Amount</span>
              <div className="text-right">
                <span className="font-bold text-emerald-700 text-sm">{formatITHB(amount)}</span>
                <span className="block text-[11px] text-slate-400">{formatTHB(amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Recipient</span>
              <span className="font-mono text-slate-800 font-medium">
                {shortenAddress(recipientAddress, 6)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Status</span>
              <StatusBadge status="released" size="sm" />
            </div>

            <div className="pt-0.5">
              <span className="text-slate-500 block mb-1">Transaction Hash</span>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200 text-slate-700">
                <span className="font-mono text-[11px] truncate max-w-[240px]">
                  {txHash}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 hover:text-slate-900 text-slate-500 rounded transition-colors ml-1 cursor-pointer"
                  title="Copy transaction hash"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Links and CTA */}
        <div className="p-6 space-y-3">
          <a
            href={getEtherscanTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <span>View on Etherscan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
