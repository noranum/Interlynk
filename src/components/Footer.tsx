import React from 'react';
import { ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { shortenAddress, getEtherscanAddressUrl } from '../services/blockchain';
import interlynkLogo from '../assets/interlynk-logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-12 pb-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50/80 border border-orange-200/60 p-1 flex items-center justify-center">
                <img
                  src={interlynkLogo}
                  alt="Interlynk"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">Interlynk</span>
            </div>
            <p className="text-slate-600 max-w-md leading-relaxed text-xs">
              Smart agreements. Safer payments. Create payment agreements where funds are released only when the agreed conditions are completed.
            </p>
            <div className="flex items-center gap-4 text-slate-500 text-[11px] pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Sepolia Testnet Active
              </span>
              <span>·</span>
              <span>MetaMask Verified</span>
              <span>·</span>
              <span>1 iTHB = ฿1 (Demo)</span>
            </div>
          </div>

          {/* Smart Contract Architecture reference */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">Contracts (Sepolia)</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <div className="text-slate-500">iTHB Token (ERC-20):</div>
                <a
                  href={getEtherscanAddressUrl(CONTRACT_ADDRESSES.iTHBToken)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-slate-700 hover:text-emerald-600 inline-flex items-center gap-1 mt-0.5"
                >
                  {shortenAddress(CONTRACT_ADDRESSES.iTHBToken, 4)}
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <div className="text-slate-500">Interlynk Escrow:</div>
                <a
                  href={getEtherscanAddressUrl(CONTRACT_ADDRESSES.interlynkEscrow)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-slate-700 hover:text-emerald-600 inline-flex items-center gap-1 mt-0.5"
                >
                  {shortenAddress(CONTRACT_ADDRESSES.interlynkEscrow, 4)}
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Protocol specs */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">Escrow Lifecycle</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li>1. Agreement Definition</li>
              <li>2. ERC-20 Token Approval</li>
              <li>3. Non-Custodial Deposit</li>
              <li>4. Proof of Work Submission</li>
              <li>5. Payer Release & Transfer</li>
            </ul>
          </div>
        </div>

        {/* Prototype Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong>Important Prototype Notice:</strong> iTHB is a fictional test token created for the Interlynk prototype. It does not represent real Thai baht, is not legal tender, and has no real monetary value. All escrow interactions occur on the Ethereum Sepolia test network or in simulated prototype mode.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>© 2026 Interlynk. Built for Hackathons & Startup Demos.</div>
          <div className="flex items-center gap-4">
            <span>Non-custodial Smart Escrow</span>
            <span>·</span>
            <span>MetaMask Integration</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
