import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity as ActivityIcon,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useEscrow } from '../context/EscrowContext';
import { formatITHB, formatTHB } from '../types/token';
import { StatusBadge } from '../components/StatusBadge';
import { shortenAddress, getEtherscanTxUrl } from '../services/blockchain';

export const ActivityPage: React.FC = () => {
  const { activities } = useEscrow();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    // Search
    const matchesSearch =
      act.escrowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.actorAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return act.status === 'funds_locked' || act.status === 'awaiting_deposit';
    }
    if (filterStatus === 'awaiting_approval') {
      return act.status === 'awaiting_approval' || act.status === 'work_submitted';
    }
    if (filterStatus === 'released') {
      return act.status === 'released';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Audit Trail
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Escrow Activity
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Track escrow agreements, token deposits, work submissions, and payment releases. View confirmed blockchain transactions on Sepolia Etherscan.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by agreement, action, or wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'awaiting_approval', label: 'Awaiting Approval' },
            { id: 'released', label: 'Released' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${filterStatus === tab.id
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ActivityIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No activity recorded</h3>
            <p className="text-xs text-slate-500">
              No transactions match your current search or filter selection.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                {/* Left side: Escrow and Action */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/escrow/${act.escrowId}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      {act.escrowName}
                    </Link>
                    <StatusBadge status={act.status} size="sm" />
                  </div>

                  <div className="text-xs font-medium text-slate-700 flex items-center gap-2">
                    <span className="text-slate-500">Action:</span>
                    <span className="font-semibold text-slate-900">{act.action}</span>
                  </div>

                  {act.details && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">{act.details}</p>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                    <span>By: {shortenAddress(act.actorAddress, 4)}</span>
                    <span>·</span>
                    <span>{new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Right side: Amount and Links */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 sm:gap-1.5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      {formatITHB(act.amount)}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {formatTHB(act.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {act.txHash && (
                      <a
                        href={getEtherscanTxUrl(act.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded"
                        title="View on Sepolia Etherscan"
                      >
                        <span>{shortenAddress(act.txHash, 3)}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}

                    <Link
                      to={`/escrow/${act.escrowId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 pl-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
