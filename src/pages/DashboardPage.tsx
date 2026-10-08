import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Lock,
  Clock,
  CheckCircle2,
  Search,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useEscrow } from '../context/EscrowContext';
import { formatITHB, formatTHB } from '../types/token';
import { StatusBadge } from '../components/StatusBadge';
import { shortenAddress } from '../services/blockchain';
import interlynkLogo from '../assets/interlynk-logo.png';

export const DashboardPage: React.FC = () => {
  const { address, ithbBalance } = useWallet();
  const { agreements } = useEscrow();
  const [filterRole, setFilterRole] = useState<'all' | 'payer' | 'recipient'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter agreements
  const filteredAgreements = agreements.filter((item) => {
    // Search query filter
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipientAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payerAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Role filter
    if (filterRole === 'payer') {
      return item.payerAddress.toLowerCase() === (address?.toLowerCase() || '');
    }
    if (filterRole === 'recipient') {
      return item.recipientAddress.toLowerCase() === (address?.toLowerCase() || '');
    }
    return true;
  });

  // Calculate stats
  const activeEscrowsCount = agreements.filter(
    (a) => a.status === 'funds_locked' || a.status === 'work_submitted' || a.status === 'awaiting_deposit'
  ).length;

  const totalLockedAmount = agreements
    .filter((a) => a.status === 'funds_locked' || a.status === 'work_submitted' || a.status === 'awaiting_approval')
    .reduce((sum, a) => sum + a.amount, 0);

  const awaitingApprovalCount = agreements.filter(
    (a) => a.status === 'awaiting_approval'
  ).length;

  const completedCount = agreements.filter(
    (a) => a.status === 'released'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Main Header with Balances & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-orange-50 border border-orange-200/80 p-2.5 flex items-center justify-center shrink-0 shadow-xs">
            <img
              src={interlynkLogo}
              alt="Interlynk"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Escrow Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Your Escrow Agreements
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Monitor non-custodial agreements, locked funds, and payment release approvals.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/escrow/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create Escrow</span>
          </Link>
        </div>
      </div>

      {/* Available Balance Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Available Balance
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            {formatITHB(ithbBalance)}
          </div>
          <div className="text-sm text-emerald-400 font-semibold mt-0.5">
            {formatTHB(ithbBalance)}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-xs">
          <div className="text-right">
            <div className="text-slate-300">Connected Wallet</div>
            <div className="font-mono text-white font-semibold">
              {address ? shortenAddress(address, 5) : 'Demo Wallet'}
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Escrows */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>Active Escrows</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeEscrowsCount}</div>
          <div className="text-[11px] text-slate-500">Agreements in progress</div>
        </div>

        {/* iTHB Locked */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>iTHB Locked</span>
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{formatITHB(totalLockedAmount)}</div>
          <div className="text-[11px] text-slate-500">{formatTHB(totalLockedAmount)} in contracts</div>
        </div>

        {/* Awaiting Approval */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>Awaiting Approval</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{awaitingApprovalCount}</div>
          <div className="text-[11px] text-slate-500">Deliverables ready for review</div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
          <div className="text-slate-500 text-xs font-semibold flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{completedCount}</div>
          <div className="text-[11px] text-slate-500">Funds released to recipient</div>
        </div>
      </div>

      {/* Escrow Agreements List Section */}
      <div className="space-y-4">
        {/* Controls: Search and Role segmented control */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterRole === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Agreements
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('payer')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterRole === 'payer'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              As Payer
            </button>
            <button
              type="button"
              onClick={() => setFilterRole('recipient')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterRole === 'recipient'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              As Recipient
            </button>
          </div>
        </div>

        {/* Agreements Grid */}
        {filteredAgreements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No escrow agreements found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No agreements matched your search or role filter. Create your first agreement to get started.
            </p>
            <Link
              to="/escrow/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Escrow Agreement</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAgreements.map((agreement) => {
              const isPayer = address?.toLowerCase() === agreement.payerAddress.toLowerCase();
              const isRecipient = address?.toLowerCase() === agreement.recipientAddress.toLowerCase();

              return (
                <div
                  key={agreement.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900 tracking-tight leading-snug">
                        {agreement.name}
                      </h3>
                      <StatusBadge status={agreement.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {agreement.description}
                    </p>
                  </div>

                  {/* Financial & Address details */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Escrow Value</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatITHB(agreement.amount)}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {formatTHB(agreement.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">Recipient</span>
                      <span className="font-mono text-slate-700 font-medium">
                        {shortenAddress(agreement.recipientAddress, 4)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Deadline</span>
                      <span className="text-slate-700 font-medium">
                        {agreement.deadline}
                      </span>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <div className="text-[11px] text-slate-400">
                      {isPayer ? 'You are Payer' : isRecipient ? 'You are Recipient' : 'Public Observer'}
                    </div>

                    <Link
                      to={`/escrow/${agreement.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <span>View Agreement</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
