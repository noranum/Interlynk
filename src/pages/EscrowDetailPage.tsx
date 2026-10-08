import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Calendar,
  Lock,
  ExternalLink,
  Coins,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  FileCheck,
  User,
  XCircle,
  Copy,
  Check,
  Repeat,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useEscrow } from '../context/EscrowContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatITHB, formatTHB } from '../types/token';
import { shortenAddress, getEtherscanTxUrl, getEtherscanAddressUrl } from '../services/blockchain';
import { ReleaseConfirmModal } from '../components/ReleaseConfirmModal';
import { ReleaseSuccessModal } from '../components/ReleaseSuccessModal';
import { MetaMaskModal } from '../components/MetaMaskModal';
import type { EscrowStatus } from '../types/escrow';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import interlynkLogo from '../assets/interlynk-logo.png';

export const EscrowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected, activePersona, switchPersona, demoMode } = useWallet();
  const {
    getAgreement,
    approveToken,
    depositFunds,
    submitWork,
    releaseFunds,
    requestChanges,
    cancelAgreement,
  } = useEscrow();

  const agreement = getAgreement(id || '');

  // Modals state
  const [isReleaseConfirmOpen, setIsReleaseConfirmOpen] = useState(false);
  const [isReleaseSuccessOpen, setIsReleaseSuccessOpen] = useState(false);
  const [releaseTxHash, setReleaseTxHash] = useState('');

  // MetaMask confirmation modal state for interactive tx
  const [metaMaskModal, setMetaMaskModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'approve' | 'deposit' | 'release' | 'cancel';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'approve',
    onConfirm: async () => { },
  });

  // Recipient submission form state
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [deliverableNote, setDeliverableNote] = useState('');
  const [deliverableLink, setDeliverableLink] = useState('');

  // Change request state
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [changeFeedback, setChangeFeedback] = useState('');

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  if (!agreement) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Agreement Not Found</h2>
        <p className="text-slate-500 text-sm">The requested escrow agreement does not exist or was deleted.</p>
        <Link
          to="/escrow"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Escrow List</span>
        </Link>
      </div>
    );
  }

  // Determine user role in this agreement
  // In demo mode or if connected address matches:
  const isPayer =
    isConnected &&
    !!address &&
    address.toLowerCase() === agreement.payerAddress.toLowerCase();

  const isRecipient =
    isConnected &&
    !!address &&
    address.toLowerCase() === agreement.recipientAddress.toLowerCase();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Pipeline step order
  const steps: { key: string; label: string; isCompleted: boolean; isCurrent: boolean }[] = [
    {
      key: 'created',
      label: 'Agreement Created',
      isCompleted: true,
      isCurrent: agreement.status === 'awaiting_token_approval' && !agreement.tokenApproved,
    },
    {
      key: 'approved',
      label: 'Token Approved',
      isCompleted: agreement.tokenApproved,
      isCurrent: agreement.status === 'awaiting_deposit' || (agreement.status === 'awaiting_token_approval' && agreement.tokenApproved),
    },
    {
      key: 'deposited',
      label: 'iTHB Deposited',
      isCompleted: agreement.fundsDeposited,
      isCurrent: agreement.status === 'awaiting_deposit',
    },
    {
      key: 'locked',
      label: 'Funds Locked',
      isCompleted: agreement.fundsDeposited && agreement.status !== 'cancelled' && agreement.status !== 'draft',
      isCurrent: agreement.status === 'funds_locked',
    },
    {
      key: 'work',
      label: 'Work Submitted',
      isCompleted: Boolean(agreement.submittedDeliverable) || agreement.status === 'awaiting_approval' || agreement.status === 'released',
      isCurrent: agreement.status === 'work_submitted',
    },
    {
      key: 'review',
      label: 'Awaiting Approval',
      isCompleted: agreement.status === 'released',
      isCurrent: agreement.status === 'awaiting_approval',
    },
    {
      key: 'released',
      label: 'Payment Released',
      isCompleted: agreement.status === 'released',
      isCurrent: agreement.status === 'released',
    },
  ];

  // Actions execution triggers with MetaMask Confirmation
  const triggerApproveToken = () => {
    setMetaMaskModal({
      isOpen: true,
      title: `Approve ${formatITHB(agreement.amount)}`,
      description: `Authorize Interlynk Escrow Contract (${shortenAddress(CONTRACT_ADDRESSES.interlynkEscrow, 4)}) to lock ${formatITHB(agreement.amount)}.`,
      actionType: 'approve',
      onConfirm: async () => {
        await approveToken(agreement.id);
      },
    });
  };

  const triggerDepositFunds = () => {
    setMetaMaskModal({
      isOpen: true,
      title: `Deposit ${formatITHB(agreement.amount)} into Escrow`,
      description: `Lock ${formatITHB(agreement.amount)} into the non-custodial escrow agreement. Tokens will be held securely until completion.`,
      actionType: 'deposit',
      onConfirm: async () => {
        await depositFunds(agreement.id);
      },
    });
  };

  const handleReleaseConfirmed = async () => {
    const tx = await releaseFunds(agreement.id);
    setReleaseTxHash(tx);
    setIsReleaseSuccessOpen(true);
  };

  const triggerCancelAgreement = () => {
    setMetaMaskModal({
      isOpen: true,
      title: `Cancel Agreement & Refund`,
      description: `Cancel this escrow agreement. If funds are currently locked, ${formatITHB(agreement.amount)} will be returned to your wallet.`,
      actionType: 'cancel',
      onConfirm: async () => {
        await cancelAgreement(agreement.id);
      },
    });
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableNote.trim()) return;

    await submitWork(agreement.id, deliverableNote, deliverableLink);
    setIsSubmitFormOpen(false);
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeFeedback.trim()) return;

    await requestChanges(agreement.id, changeFeedback);
    setIsChangeRequestOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top back navigation and Role Switch banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/escrow"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Escrows</span>
        </Link>
      </div>

      {/* Main Agreement Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 p-2 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={interlynkLogo}
                alt="Interlynk"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {agreement.name}
                </h1>
                <StatusBadge status={agreement.status} size="md" />
              </div>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
                {agreement.description}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-right shrink-0">
            <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
              Escrow Value
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              {formatITHB(agreement.amount)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {formatTHB(agreement.amount)}
            </div>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Escrow Lifecycle Progress
            </span>
            <span className="text-xs text-slate-500">
              Sepolia Testnet Non-Custodial Contract
            </span>
          </div>

          {/* Stepper bar desktop */}
          <div className="hidden lg:grid grid-cols-7 gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.key}
                className={`p-3 rounded-xl border text-center transition-all ${step.isCurrent
                  ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-400/30'
                  : step.isCompleted
                    ? 'border-slate-200 bg-slate-50 text-slate-800'
                    : 'border-slate-100 bg-slate-50/40 text-slate-400'
                  }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  Step {idx + 1}
                </div>
                <div className="text-xs font-semibold leading-tight flex items-center justify-center gap-1">
                  {step.isCompleted && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                  <span>{step.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stepper mobile */}
          <div className="lg:hidden p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Current Phase:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {steps.find((s) => s.isCurrent)?.label || 'Completed'}
              </div>
            </div>
            <StatusBadge status={agreement.status} size="sm" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Actions & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Role Actions & Interactive Flows */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payer Action Card */}
          {isPayer && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    P
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Payer Actions</h3>
                    <p className="text-[11px] text-slate-500">You created this escrow agreement</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {shortenAddress(agreement.payerAddress, 4)}
                </span>
              </div>

              {/* Step 1: Approve Token */}
              {!agreement.tokenApproved && agreement.status === 'awaiting_token_approval' && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Coins className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">
                        Step 1: Approve iTHB Allowance
                      </h4>
                      <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                        Before depositing, approve the Interlynk Escrow smart contract to spend {formatITHB(agreement.amount)} of your iTHB.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerApproveToken}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Approve {formatITHB(agreement.amount)}</span>
                  </button>
                </div>
              )}

              {/* Step 2: Deposit into Escrow */}
              {agreement.tokenApproved && !agreement.fundsDeposited && (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-900 text-sm">
                        Step 2: Deposit into Escrow
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                        Approval confirmed! Now deposit {formatITHB(agreement.amount)} into the escrow smart contract to lock the funds.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerDepositFunds}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Deposit into Escrow</span>
                  </button>
                </div>
              )}

              {/* Waiting for Recipient */}
              {agreement.fundsDeposited && agreement.status === 'funds_locked' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Funds Locked in Escrow</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {formatITHB(agreement.amount)} is secured. Waiting for recipient ({shortenAddress(agreement.recipientAddress, 4)}) to complete the work and submit deliverables.
                  </p>
                  {agreement.feedbackNote && (
                    <div className="p-2.5 rounded bg-amber-50 text-amber-900 border border-amber-200 mt-2">
                      <strong>Previous feedback sent:</strong> {agreement.feedbackNote}
                    </div>
                  )}
                </div>
              )}

              {/* Review and Release */}
              {agreement.status === 'awaiting_approval' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-orange-50/80 border border-orange-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-orange-900 text-sm">
                      <FileCheck className="w-4 h-4 text-orange-600" />
                      <span>Deliverables Submitted for Your Review</span>
                    </div>
                    <p className="text-orange-800 leading-relaxed">
                      The recipient has completed the agreed task. Inspect the deliverables below and release payment when satisfied.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReleaseConfirmOpen(true)}
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Release Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsChangeRequestOpen(!isChangeRequestOpen)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span>Request Changes</span>
                    </button>
                  </div>

                  {/* Change feedback form */}
                  {isChangeRequestOpen && (
                    <form onSubmit={handleSendFeedback} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="block text-xs font-bold text-slate-800">
                        Specify Required Revisions
                      </label>
                      <textarea
                        rows={2}
                        value={changeFeedback}
                        onChange={(e) => setChangeFeedback(e.target.value)}
                        placeholder="Please adjust the primary logo vector colors according to the guide..."
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsChangeRequestOpen(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
                        >
                          Submit Revision Request
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Released celebration */}
              {agreement.status === 'released' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Released Successfully</span>
                  </div>

                  <p className="text-emerald-800 leading-relaxed">
                    {formatITHB(agreement.amount)} has been released from the Interlynk escrow contract
                    to the recipient wallet on Sepolia.
                  </p>

                  {agreement.releaseTxHash && (
                    <a
                      href={getEtherscanTxUrl(agreement.releaseTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      View release transaction on Etherscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recipient Action Card */}
          {isRecipient && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    R
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Recipient Actions</h3>
                    <p className="text-[11px] text-slate-500">You are the designated payment recipient</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                  {shortenAddress(agreement.recipientAddress, 4)}
                </span>
              </div>

              {/* Recipient Sees Funds Secured */}
              {agreement.fundsDeposited && agreement.status === 'funds_locked' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>Funds Secured</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      <strong>{formatITHB(agreement.amount)}</strong> has been deposited into escrow and is waiting for the agreement to be completed. You can work with 100% confidence.
                    </p>
                  </div>

                  {!isSubmitFormOpen ? (
                    <button
                      type="button"
                      onClick={() => setIsSubmitFormOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-emerald-400" />
                      <span>Mark Work as Submitted</span>
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitDeliverable} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-900 text-xs">Submit Deliverables for Approval</div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Completion Summary / Note</label>
                        <textarea
                          rows={3}
                          value={deliverableNote}
                          onChange={(e) => setDeliverableNote(e.target.value)}
                          placeholder="Completed all logo versions, vector SVGs, and brand guide PDF."
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Deliverable Link / URL (Optional)</label>
                        <input
                          type="url"
                          value={deliverableLink}
                          onChange={(e) => setDeliverableLink(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsSubmitFormOpen(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          Submit Work
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Recipient Awaiting Approval */}
              {agreement.status === 'awaiting_approval' && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-orange-900 text-sm">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Work Submitted — Awaiting Payer Approval</span>
                  </div>
                  <p className="text-orange-800 leading-relaxed">
                    Your deliverable was submitted. The payer is reviewing the submission. As soon as approved, {formatITHB(agreement.amount)} will be transferred directly to your wallet.
                  </p>
                </div>
              )}

              {/* Recipient Released */}
              {agreement.status === 'released' && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment Received!</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Congratulations! {formatITHB(agreement.amount)} ({formatTHB(agreement.amount)}) has been released and credited to your wallet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Deliverables Section (if submitted) */}
          {agreement.submittedDeliverable && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Submitted Deliverable</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(agreement.submittedDeliverable.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {agreement.submittedDeliverable.note}
              </p>

              {agreement.submittedDeliverable.link && (
                <a
                  href={agreement.submittedDeliverable.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200"
                >
                  <span>Open Deliverables Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Agreement Specs & Blockchain Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Terms & Release Condition */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Agreement Terms & Conditions
            </h3>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700">Release Condition:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed">
                "{agreement.releaseCondition}"
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created Date:</span>
                <span className="font-medium text-slate-800">
                  {new Date(agreement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Agreed Deadline:</span>
                <span className="font-medium text-slate-800">{agreement.deadline}</span>
              </div>
            </div>
          </div>

          {/* Involved Parties & Contracts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Smart Contract Architecture
            </h3>

            <div className="space-y-3 text-xs">
              {/* Payer Address */}
              <div>
                <div className="text-slate-500 text-[11px] mb-1">Payer Wallet</div>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                  <span className="truncate max-w-[200px]">{agreement.payerAddress}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(agreement.payerAddress)}
                    className="p-1 hover:text-slate-900 text-slate-500 cursor-pointer"
                  >
                    {copiedAddress === agreement.payerAddress ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <div className="text-slate-500 text-[11px] mb-1">Recipient Wallet</div>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                  <span className="truncate max-w-[200px]">{agreement.recipientAddress}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(agreement.recipientAddress)}
                    className="p-1 hover:text-slate-900 text-slate-500 cursor-pointer"
                  >
                    {copiedAddress === agreement.recipientAddress ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {/* Interlynk Escrow Contract */}
              <div>
                <div className="text-slate-500 text-[11px] mb-1">
                  Escrow Smart Contract (Sepolia)
                </div>

                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESSES.interlynkEscrow}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-emerald-700 hover:text-emerald-800"
                >
                  <span className="font-mono truncate">
                    {CONTRACT_ADDRESSES.interlynkEscrow}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation and Success Modals */}
      <ReleaseConfirmModal
        isOpen={isReleaseConfirmOpen}
        onClose={() => setIsReleaseConfirmOpen(false)}
        onConfirm={handleReleaseConfirmed}
        agreement={agreement}
      />

      <ReleaseSuccessModal
        isOpen={isReleaseSuccessOpen}
        onClose={() => setIsReleaseSuccessOpen(false)}
        amount={agreement.amount}
        recipientAddress={agreement.recipientAddress}
        txHash={releaseTxHash || agreement.releaseTxHash || '0x...'}
      />

      <MetaMaskModal
        isOpen={metaMaskModal.isOpen}
        onClose={() => setMetaMaskModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={metaMaskModal.onConfirm}
        title={metaMaskModal.title}
        description={metaMaskModal.description}
        actionType={metaMaskModal.actionType}
        amount={agreement.amount}
        recipientAddress={agreement.recipientAddress}
      />
    </div>
  );
};
