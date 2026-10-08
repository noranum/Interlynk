import React, { useState } from 'react';
import { AlertTriangle, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { formatITHB, formatTHB } from '../types/token';
import { shortenAddress } from '../services/blockchain';
import { EscrowAgreement } from '../types/escrow';

interface ReleaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  agreement: EscrowAgreement;
}

export const ReleaseConfirmModal: React.FC<ReleaseConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  agreement,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Warning Header */}
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 text-sm">Release Escrow Payment</h3>
            <p className="text-xs text-amber-700">Irreversible Blockchain Transfer</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            You are about to release <span className="font-bold text-slate-900">{formatITHB(agreement.amount)}</span> to the recipient. Once confirmed on the blockchain, this action cannot be reversed.
          </p>

          {/* Details Card */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Agreement</span>
              <span className="font-semibold text-slate-900">{agreement.name}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Recipient</span>
              <span className="font-mono text-slate-800 font-medium">
                {shortenAddress(agreement.recipientAddress, 6)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Amount</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatITHB(agreement.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-slate-500">Equivalent display</span>
              <span className="font-medium text-slate-700">
                {formatTHB(agreement.amount)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-100/80 p-3 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              The Interlynk Escrow contract will transfer {formatITHB(agreement.amount)} directly to the recipient wallet. This prototype runs on Sepolia testnet.
            </span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming in MetaMask...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirm in MetaMask</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
