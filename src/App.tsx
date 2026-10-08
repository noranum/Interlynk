/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { EscrowProvider } from './context/EscrowContext';
import { Navbar } from './components/Navbar';
import { NetworkAlert } from './components/NetworkAlert';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateEscrowPage } from './pages/CreateEscrowPage';
import { EscrowDetailPage } from './pages/EscrowDetailPage';
import { ActivityPage } from './pages/ActivityPage';

export default function App() {
  return (
    <WalletProvider>
      <EscrowProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            {/* Wrong Network alert bar if not on Sepolia */}
            <NetworkAlert />

            {/* Persistent Top Navigation with MetaMask Wallet controls */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/escrow" element={<DashboardPage />} />
                <Route path="/escrow/create" element={<CreateEscrowPage />} />
                <Route path="/escrow/:id" element={<EscrowDetailPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer with Sepolia and Prototype Disclaimer */}
            <Footer />
          </div>
        </BrowserRouter>
      </EscrowProvider>
    </WalletProvider>
  );
}
