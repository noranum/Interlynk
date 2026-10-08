import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Check,
  Repeat,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { shortenAddress, getEtherscanAddressUrl } from '../services/blockchain';
import { formatITHB, formatTHB } from '../types/token';
import interlynkLogo from '../assets/interlynk-logo.png';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    address,
    isConnected,
    isConnecting,
    isSepolia,
    ethBalance,
    ithbBalance,
    demoMode,
    activePersona,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    switchPersona,
  } = useWallet();

  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsWalletMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Escrow', path: '/escrow' },
    { label: 'Activity', path: '/activity' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-orange-50/80 border border-orange-200/60 flex items-center justify-center p-1.5 shadow-xs group-hover:scale-105 transition-all">
                  <img
                    src={interlynkLogo}
                    alt="Interlynk"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
                    Interlynk
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wide -mt-0.5">
                    Smart Escrow
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive =
                    link.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-slate-900 bg-slate-100/80 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Persona quick switch for prototype demo */}
              {demoMode && isConnected && (
                <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs border border-slate-200/70">
                  <span className="text-slate-500 text-[11px] px-1.5 font-medium">Role:</span>
                  <button
                    type="button"
                    onClick={() => switchPersona('payer')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      activePersona === 'payer'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Preview as Payer
                  </button>
                  <button
                    type="button"
                    onClick={() => switchPersona('recipient')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      activePersona === 'recipient'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Preview as Recipient
                  </button>
                </div>
              )}

              {/* Network badge */}
              {isConnected && (
                <button
                  type="button"
                  onClick={() => !isSepolia && switchNetwork()}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    isSepolia
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer animate-pulse'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSepolia ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span>{isSepolia ? 'Sepolia' : 'Wrong Net'}</span>
                </button>
              )}

              {/* Wallet Button */}
              {isConnected && address ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[11px]">
                      🦊
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="font-mono text-slate-900 font-semibold leading-tight">
                        {shortenAddress(address, 4)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-sans">
                        {formatITHB(ithbBalance)}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Wallet Menu Dropdown */}
                  {isWalletMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-3 px-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Connection status header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-slate-900">Connected</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {isSepolia ? 'Sepolia Testnet' : 'Other Network'}
                        </span>
                      </div>

                      {/* Full address & Copy */}
                      <div className="py-3 border-b border-slate-100">
                        <div className="text-[11px] text-slate-500 mb-1">Wallet Address</div>
                        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 font-mono text-[11px] text-slate-800">
                          <span className="truncate max-w-[190px]">{address}</span>
                          <button
                            type="button"
                            onClick={handleCopyAddress}
                            className="p-1 hover:text-slate-900 text-slate-500 cursor-pointer"
                            title="Copy Address"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Balances */}
                      <div className="py-3 border-b border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">ETH Balance (Gas)</span>
                          <span className="font-mono font-medium text-slate-800">{ethBalance} ETH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">iTHB Balance</span>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">{formatITHB(ithbBalance)}</span>
                            <span className="block text-[10px] text-slate-400">{formatTHB(ithbBalance)}</span>
                          </div>
                        </div>
                      </div>
                      {/* Action Links */}
                      <div className="pt-2.5 space-y-1">
                        <a
                          href={getEtherscanAddressUrl(address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-2 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            View on Etherscan
                          </span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setIsWalletMenuOpen(false);
                            disconnectWallet();
                          }}
                          className="w-full flex items-center justify-between px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            Disconnect
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => connectWallet()}
                  disabled={isConnecting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
