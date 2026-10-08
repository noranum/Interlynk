import React, { useState } from 'react';
import { ShieldCheck, Fuel, AlertCircle, CheckCircle2, Loader2, ArrowUpRight } from 'lucide-react';
import { formatITHB, formatTHB } from '../types/token';
import { shortenAddress } from '../services/blockchain';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import interlynkLogo from '../assets/interlynk-logo.png';

interface MetaMaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  actionType: 'approve' | 'deposit' | 'release' | 'cancel';
  amount?: number;
  recipientAddress?: string;
  contractAddress?: string;
}

export const MetaMaskModal: React.FC<MetaMaskModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionType,
  amount,
  recipientAddress,
  contractAddress = CONTRACT_ADDRESSES.interlynkEscrow,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'prompt' | 'pending' | 'success'>('prompt');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setStatus('pending');
    try {
      // Simulate real confirmation delay like real MetaMask block inclusion
      await new Promise((res) => setTimeout(res, 900));
      await onConfirm();
      setStatus('success');
      setTimeout(() => {
        setIsSubmitting(false);
        setStatus('prompt');
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setStatus('prompt');
    }
  };

  const getActionBadge = () => {
    switch (actionType) {
      case 'approve':
        return { label: 'Token Approval', sub: 'ERC-20 approve() permission' };
      case 'deposit':
        return { label: 'Deposit into Escrow', sub: 'Lock iTHB in smart contract' };
      case 'release':
        return { label: 'Release Payment', sub: 'Transfer iTHB to recipient' };
      case 'cancel':
        return { label: 'Cancel & Refund', sub: 'Return funds to payer' };
    }
  };

  const actionInfo = getActionBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* MetaMask Header */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-orange-200 p-1 flex items-center justify-center">
                <img
                  src={interlynkLogo}
                  alt="Interlynk"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-orange-300 font-bold text-xs">↔</span>
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-orange-200 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                  <path d="M29.5 7.5L18.5 1L16 6.5L24.5 13L29.5 7.5Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.5"/>
                  <path d="M2.5 7.5L13.5 1L15.9 6.5L7.5 13L2.5 7.5Z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.5"/>
                  <path d="M25.5 21.5L29 16.5L24.5 13L21 19.5L25.5 21.5Z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.5"/>
                  <path d="M6.5 21.5L3 16.5L7.5 13L11 19.5L6.5 21.5Z" fill="#E4751F" stroke="#E4751F" strokeWidth="0.5"/>
                  <path d="M10.5 14L16 11.5L21.5 14L18 20.5H14L10.5 14Z" fill="#D7C1B3"/>
                  <path d="M16 23.5L12 28.5H20L16 23.5Z" fill="#233447"/>
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Interlynk × MetaMask</h3>
              <p className="text-[11px] text-slate-500">Ethereum Sepolia Testnet</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-100/80 text-orange-800 font-semibold">
            Sepolia: 11155111
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              {actionInfo.label}
            </div>
            <h4 className="text-lg font-bold text-slate-900">{title}</h4>
            <p className="text-sm text-slate-600 mt-1">{description}</p>
          </div>

          {/* Transaction Parameters */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 text-xs">
            {amount !== undefined && (
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500">Transaction Value</span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">{formatITHB(amount)}</span>
                  <div className="text-[11px] text-slate-500">{formatTHB(amount)}</div>
                </div>
              </div>
            )}

            {recipientAddress && (
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-slate-500">Recipient Account</span>
                <span className="font-mono text-slate-800 font-medium">
                  {shortenAddress(recipientAddress, 6)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-slate-500">Target Contract</span>
              <span className="font-mono text-slate-700">
                {shortenAddress(contractAddress, 5)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-slate-500 flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-slate-400" />
                Est. Gas Fee
              </span>
              <span className="font-mono text-slate-700">≈ 0.00042 ETH ($1.15)</span>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800">Verified Interlynk Smart Contract</p>
              <p className="text-emerald-700/90 text-[11px] mt-0.5">
                Funds are held in escrow and protected by deterministic code rules.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-70 cursor-pointer"
          >
            {status === 'pending' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming in MetaMask...</span>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Confirmed!</span>
              </>
            ) : (
              <>
                <span>Confirm in MetaMask</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
