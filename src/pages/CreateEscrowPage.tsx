import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Coins,
  ArrowLeft,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useEscrow } from '../context/EscrowContext';
import { isValidEthereumAddress, shortenAddress } from '../services/blockchain';
import { formatITHB, formatTHB } from '../types/token';
import interlynkLogo from '../assets/interlynk-logo.png';

export const CreateEscrowPage: React.FC = () => {
  const navigate = useNavigate();
  const { ithbBalance } = useWallet();
  const { createAgreement } = useEscrow();

  const [name, setName] = useState('Logo Design');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('5000');
  const [description, setDescription] = useState(
    'Payment for designing the Interlynk company logo and vector branding identity assets.'
  );
  const [releaseCondition, setReleaseCondition] = useState(
    'Final logo files (AI, SVG, dark/light transparent PNGs) and brand guide delivered and approved by the payer.'
  );
  const [deadline, setDeadline] = useState('2026-10-15');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionError, setTransactionError] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const isAddressValid = isValidEthereumAddress(recipientAddress);
  const hasSufficientBalance = ithbBalance >= numAmount;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Agreement name is required';
    }

    if (!recipientAddress.trim()) {
      newErrors.recipientAddress = 'Recipient wallet address is required';
    } else if (!isValidEthereumAddress(recipientAddress)) {
      newErrors.recipientAddress = 'Please enter a valid Ethereum address (0x...)';
    }

    if (!amount || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (!hasSufficientBalance) {
      newErrors.amount = `Insufficient iTHB balance (${formatITHB(ithbBalance)} available)`;
    }

    if (!description.trim()) {
      newErrors.description = 'Agreement description is required';
    }

    if (!releaseCondition.trim()) {
      newErrors.releaseCondition = 'Release condition is required to protect both parties';
    }

    if (!deadline) {
      newErrors.deadline = 'Please select a completion deadline';
    } else {
      const today = new Date().toLocaleDateString('en-CA');

      if (deadline < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setTransactionError('');
    setIsSubmitting(true);
    try {
      const newId = await createAgreement({
        name,
        recipientAddress,
        amount,
        description,
        releaseCondition,
        deadline,
      });

      // Redirect directly to the escrow detail page
      navigate(`/escrow/${newId}`);
    } catch (err: unknown) {
      console.error('Failed to create escrow:', err);

      const error = err as {
        code?: number | string;
        message?: string;
      };

      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        setTransactionError('Transaction cancelled in MetaMask.');
      } else {
        setTransactionError(
          error.message || 'Failed to create escrow. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/escrow"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Escrow Dashboard</span>
      </Link>

      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Escrow Agreement
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Create an agreement between a payer and recipient. Your iTHB stays locked until the agreed condition is completed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agreement Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-slate-900">
                Agreement Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Logo Design"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition-colors ${errors.name
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                  }`}
              />
              {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
            </div>

            {/* Recipient Wallet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="recipient" className="block text-xs font-bold text-slate-900">
                  Recipient Wallet Address
                </label>
              </div>
              <input
                id="recipient"
                type="text"
                placeholder="Enter recipient MetaMask address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm font-mono bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition-colors ${errors.recipientAddress
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                  }`}
              />
              {errors.recipientAddress ? (
                <p className="text-xs text-rose-600">{errors.recipientAddress}</p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Must be a valid Ethereum format address on Sepolia.
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="amount" className="block text-xs font-bold text-slate-900">
                  Escrow Amount (iTHB)
                </label>
                <span className="text-[11px] text-slate-500">
                  Available: <strong className="text-slate-800">{formatITHB(ithbBalance)}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm font-bold bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition-colors ${errors.amount
                    ? 'border-rose-300 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                    }`}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-800">iTHB</span>
                  <span className="text-slate-400 font-normal">({formatTHB(numAmount)})</span>
                </div>
              </div>
              {errors.amount && <p className="text-xs text-rose-600">{errors.amount}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-bold text-slate-900">
                Agreement Description
              </label>
              <textarea
                id="description"
                rows={2}
                placeholder="Payment for designing the Interlynk company logo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition-colors ${errors.description
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                  }`}
              />
              {errors.description && <p className="text-xs text-rose-600">{errors.description}</p>}
            </div>

            {/* Release Condition */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <label htmlFor="condition" className="block text-xs font-bold text-slate-900">
                  Release Condition
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold">(Critical)</span>
              </div>
              <textarea
                id="condition"
                rows={2}
                placeholder="Release payment after the final logo files are delivered and approved..."
                value={releaseCondition}
                onChange={(e) => setReleaseCondition(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition-colors ${errors.releaseCondition
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                  }`}
              />
              {errors.releaseCondition ? (
                <p className="text-xs text-rose-600">{errors.releaseCondition}</p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Funds will remain locked until this exact condition is completed and approved.
                </p>
              )}
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label htmlFor="deadline" className="block text-xs font-bold text-slate-900">
                Deadline
              </label>
              <div className="relative">
                <input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition-colors ${errors.deadline
                    ? 'border-rose-300 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
                    }`}
                />
              </div>
              {errors.deadline && <p className="text-xs text-rose-600">{errors.deadline}</p>}
            </div>
            {transactionError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {transactionError}
              </div>
            )}
            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating Agreement...' : 'Create Escrow'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </form>
        </div>

        {/* Live Agreement Summary Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Agreement Summary
                </div>
                <h3 className="text-xl font-extrabold mt-1 text-white">
                  {name || 'Untitled Agreement'}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 p-2 flex items-center justify-center shrink-0">
                <img
                  src={interlynkLogo}
                  alt="Interlynk"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Financial summary */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-slate-300">Recipient</span>
                <span className="font-mono text-emerald-300 font-semibold">
                  {recipientAddress && isValidEthereumAddress(recipientAddress)
                    ? shortenAddress(recipientAddress, 4)
                    : 'Not configured'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-slate-300">Amount</span>
                <div className="text-right">
                  <span className="font-extrabold text-white text-base">
                    {formatITHB(numAmount)}
                  </span>
                  <div className="text-[11px] text-emerald-300 font-medium">
                    {formatTHB(numAmount)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-300">Deadline</span>
                <span className="text-white font-medium">{deadline || 'No deadline'}</span>
              </div>
            </div>

            {/* Condition preview */}
            <div className="space-y-1.5 text-xs">
              <div className="text-slate-300 font-medium">Release Condition:</div>
              <p className="bg-white/5 rounded-lg p-3 border border-white/5 text-slate-200 text-xs leading-relaxed">
                {releaseCondition || 'No condition defined yet.'}
              </p>
            </div>

            {/* Next steps guidance */}
            <div className="pt-2 border-t border-white/10 space-y-2 text-[11px] text-slate-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Two-Step Funding Process
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                <li>Step 1: Approve iTHB token allowance in MetaMask</li>
                <li>Step 2: Deposit into Interlynk Escrow contract</li>
              </ol>
            </div>
          </div>

          {/* Testnet reassurance */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
            <Coins className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">1 iTHB = ฿1 (Demo Token)</div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                iTHB is a test token on Ethereum Sepolia. Transactions require MetaMask confirmation with test gas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
