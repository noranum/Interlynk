import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Lock,
  CheckCircle2,
  FileCheck,
  Send,
  HelpCircle,
  Coins,
  Wallet,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useEscrow } from '../context/EscrowContext';
import { formatITHB, formatTHB } from '../types/token';
import interlynkLogo from '../assets/interlynk-logo.png';

export const LandingPage: React.FC = () => {
  const { isConnected, connectWallet, ithbBalance } = useWallet();
  const { agreements } = useEscrow();

  const latestAgreement = [...agreements].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )[0];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-950 text-xs font-semibold shadow-2xs">
                <img
                  src={interlynkLogo}
                  alt="Interlynk"
                  className="w-4 h-4 object-contain shrink-0"
                />
                <span>Interlynk Smart Escrow · Ethereum Sepolia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Payments should follow <span className="text-emerald-700">agreements.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Interlynk lets two parties create a payment agreement, lock funds securely, and release payment only when the agreed conditions are completed.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/escrow/create"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Create Escrow</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </Link>

                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => connectWallet()}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm shadow-xs transition-all cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-orange-500" />
                    <span>Connect MetaMask</span>
                  </button>
                ) : (
                  <Link
                    to="/escrow"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-sm transition-all"
                  >
                    <span>View Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Demo Mode Reassurance Notice */}
              <div className="pt-4 flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Non-Custodial Escrow</span>
                </div>
                <span>·</span>
                <span>Requires MetaMask Signature</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">1 iTHB = ฿1 Demo Peg</span>
              </div>
            </div>

            {/* Right Column: Live Escrow Card Showcase */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Decorative background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-20" />

                <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 space-y-5">
                  {/* Escrow header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Latest Escrow Agreement
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        {latestAgreement ? latestAgreement.name : 'No Escrow Agreements Yet'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {latestAgreement ? (
                          <>
                            Payer: {latestAgreement.payerAddress.slice(0, 6)}...
                            {latestAgreement.payerAddress.slice(-4)}
                            {' → '}
                            Recipient: {latestAgreement.recipientAddress.slice(0, 6)}...
                            {latestAgreement.recipientAddress.slice(-4)}
                          </>
                        ) : (
                          'No payer or recipient yet'
                        )}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {latestAgreement
                        ? latestAgreement.status === 'released'
                          ? 'Payment Released'
                          : latestAgreement.status === 'funds_locked'
                            ? 'Funds Locked'
                            : latestAgreement.status.replace(/_/g, ' ')
                        : 'No Agreement'}
                    </span>
                  </div>

                  {/* Financial amount box */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">
                        {latestAgreement?.status === 'released'
                          ? 'Total Payment Released'
                          : 'Escrow Agreement Amount'}
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {latestAgreement ? formatITHB(latestAgreement.amount) : '0 iTHB'}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {latestAgreement ? `≈ ${formatTHB(latestAgreement.amount)}` : '≈ ฿0'}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Release Condition */}
                  <div className="space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-slate-500" />
                      Release Condition
                    </div>
                    <p className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-600 leading-relaxed text-xs">
                      {latestAgreement
                        ? latestAgreement.releaseCondition
                        : 'No release condition available.'}
                    </p>
                  </div>

                  {/* Dynamic Escrow Progress */}
                  <div className="pt-2">
                    {(() => {
                      const status = latestAgreement?.status;

                      const isReleased = status === 'released';
                      const isFunded =
                        latestAgreement?.fundsDeposited ||
                        ['funds_locked', 'work_submitted', 'awaiting_approval', 'released'].includes(status ?? '');

                      const progress = isReleased ? '100%' : isFunded ? '66.67%' : status ? '33.33%' : '0%';

                      return (
                        <>
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-2">
                            <span className={status ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                              1. Agreement Created {status ? '✓' : ''}
                            </span>

                            <span className={isFunded ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                              2. Funds Locked {isFunded ? '✓' : ''}
                            </span>

                            <span className={isReleased ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                              3. Payment Released {isReleased ? '✓' : ''}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: progress }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {/* Action row */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {latestAgreement?.releaseTxHash
                        ? `Release Tx: ${latestAgreement.releaseTxHash.slice(0, 8)}...${latestAgreement.releaseTxHash.slice(-4)}`
                        : latestAgreement?.depositTxHash
                          ? `Deposit Tx: ${latestAgreement.depositTxHash.slice(0, 8)}...${latestAgreement.depositTxHash.slice(-4)}`
                          : 'Sepolia Testnet'}
                    </span>
                    <Link
                      to={latestAgreement ? `/escrow/${latestAgreement.id}` : '/escrow'}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      {latestAgreement ? 'View Agreement' : 'View My Escrows'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Interlynk Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Smart Money Coordination
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How Interlynk Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Interlynk turns agreements into rules that payments follow. Here is the complete lifecycle from start to release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Create Agreement</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define who gets paid, how much in iTHB, the deadline, and the exact condition required for payment release.
            </p>
            <div className="text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100">
              Clear mutual expectations
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Lock iTHB</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The payer deposits iTHB into the escrow agreement using MetaMask. Funds are held safely in deterministic code.
            </p>
            <div className="text-[11px] font-medium text-emerald-700 pt-2 border-t border-slate-100">
              Recipient can work with confidence
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Complete the Work</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The recipient completes the agreed task, submits deliverable proofs or files, and requests review.
            </p>
            <div className="text-[11px] font-medium text-indigo-700 pt-2 border-t border-slate-100">
              Transparent proof of delivery
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900">Release Payment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once the payer approves the completed work, the escrow contract releases the iTHB directly to the recipient.
            </p>
            <div className="text-[11px] font-medium text-teal-700 pt-2 border-t border-slate-100">
              Instant non-custodial payout
            </div>
          </div>
        </div>
      </section>

      {/* iTHB Token Spotlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl text-white p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Coins className="w-3.5 h-3.5" />
                <span>Prototype Payment Token</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-500/30 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={interlynkLogo}
                    alt="Interlynk"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  iTHB — Interlynk Thai Baht
                </h2>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                For clear, stable agreements, Interlynk uses a fictional ERC-20 token where amounts match real-world pricing:
              </p>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-emerald-300 font-bold text-lg">
                1 iTHB = ฿1
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-white font-bold">500 iTHB</div>
                  <div className="text-slate-400 mt-0.5">≈ ฿500</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-white font-bold">5,000 iTHB</div>
                  <div className="text-slate-400 mt-0.5">≈ ฿5,000</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-white font-bold">10,000 iTHB</div>
                  <div className="text-slate-400 mt-0.5">≈ ฿10,000</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                * iTHB is a test token used for the Interlynk prototype on Ethereum Sepolia and does not represent real Thai baht.
              </p>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                Why Tokenized Escrow?
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Volatility Risk:</strong> Fictional 1:1 Thai Baht representation keeps agreement values predictable.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Deterministic Rules:</strong> Money cannot be withdrawn or spent until release conditions are met.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Two-step Approval:</strong> Standard ERC-20 approve() and deposit() prevents unauthorized token movement.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to test smart escrow payments?
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
            Create an agreement, test both payer and recipient workflows, and experience how payments follow agreements with MetaMask.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/escrow/create"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>Create Escrow Agreement</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
            <Link
              to="/escrow"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-sm transition-all"
            >
              <span>Explore Dashboard</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
