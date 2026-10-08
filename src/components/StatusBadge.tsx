import React from 'react';
import { EscrowStatus } from '../types/escrow';

interface StatusBadgeProps {
  status: EscrowStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          dotColor: 'bg-slate-400',
          textColor: 'text-slate-600',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
        };
      case 'awaiting_token_approval':
        return {
          label: 'Awaiting Token Approval',
          dotColor: 'bg-amber-400 animate-pulse',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'awaiting_deposit':
        return {
          label: 'Awaiting Deposit',
          dotColor: 'bg-amber-500 animate-pulse',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'funds_locked':
        return {
          label: 'Funds Locked',
          dotColor: 'bg-indigo-500',
          textColor: 'text-indigo-800',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
        };
      case 'work_submitted':
        return {
          label: 'Work Submitted',
          dotColor: 'bg-blue-500 animate-pulse',
          textColor: 'text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'awaiting_approval':
        return {
          label: 'Awaiting Approval',
          dotColor: 'bg-orange-500 animate-pulse',
          textColor: 'text-orange-800',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      case 'released':
        return {
          label: 'Released',
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-800',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          dotColor: 'bg-slate-400',
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
        };
      case 'refunded':
        return {
          label: 'Refunded',
          dotColor: 'bg-rose-500',
          textColor: 'text-rose-800',
          bgColor: 'bg-rose-50',
          borderColor: 'border-rose-200',
        };
      default:
        return {
          label: status,
          dotColor: 'bg-slate-400',
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-medium px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${config.bgColor} ${config.borderColor} ${config.textColor} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span>{config.label}</span>
    </span>
  );
};
