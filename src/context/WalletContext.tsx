import { ethers } from 'ethers';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  isMetaMaskAvailable,
  requestMetaMaskAccounts,
  getConnectedChainId,
  switchToSepoliaNetwork,
} from '../services/blockchain';
import {
  SEPOLIA_CHAIN_ID,
  CONTRACT_ADDRESSES,
  ERC20_ABI,
} from '../config/contracts';

export type DemoPersona = 'payer' | 'recipient' | 'custom';

export const DEMO_PAYER_ADDRESS = '0x71F2479B3D801a6E9c122B437Fe06D67375234A9';
export const DEMO_RECIPIENT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  isSepolia: boolean;
  ethBalance: string;
  ithbBalance: number;
  isMetaMaskInstalled: boolean;
  demoMode: boolean;
  activePersona: DemoPersona;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
  switchPersona: (persona: DemoPersona) => void;
  addIthbBalance: (amount: number) => void;
  deductIthbBalance: (amount: number) => void;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(() => {
    return localStorage.getItem('interlynk_connected_address');
  });
  const [isConnected, setIsConnected] = useState<boolean>(() => {
  return localStorage.getItem('interlynk_is_connected') === 'true';
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(SEPOLIA_CHAIN_ID);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [ithbBalance, setIthbBalance] = useState<number>(0);
  const [demoMode, setDemoModeState] = useState<boolean>(false);
  const [activePersona, setActivePersona] = useState<DemoPersona>(() => {
    return (localStorage.getItem('interlynk_persona') as DemoPersona) || 'payer';
  });
  const [error, setError] = useState<string | null>(null);

  const isMetaMaskInstalled = isMetaMaskAvailable();
  const isSepolia = chainId === SEPOLIA_CHAIN_ID;

  // Persist demo mode
  const setDemoMode = (enabled: boolean) => {
    setDemoModeState(enabled);
    localStorage.setItem('interlynk_demo_mode', enabled.toString());
  };

  // Update ETH balance when address changes
  const refreshBalances = useCallback(async (walletAddress: string) => {
  if (!walletAddress || !window.ethereum) return;

  if (!demoMode) {
    try {
      // Read real Sepolia ETH balance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const rawEthBalance = await provider.getBalance(walletAddress);
      const formattedEth = ethers.formatEther(rawEthBalance);
      
      setEthBalance(parseFloat(formattedEth).toFixed(4));

      // Connect to your real iTHB ERC-20 contract
      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.iTHBToken,
        ERC20_ABI,
        provider
      );
      
      // Read decimals from the actual token contract
      const decimals = await tokenContract.decimals();
      // Normalize the MetaMask address so ethers accepts it
      const normalizedAddress = ethers.getAddress(walletAddress.toLowerCase());
      // Read this MetaMask account's real iTHB balance
      const rawBalance = await tokenContract.balanceOf(normalizedAddress);
      // Convert blockchain units into normal iTHB
      const formattedBalance = ethers.formatUnits(
        rawBalance,
        Number(decimals)
     );

      setIthbBalance(parseFloat(formattedBalance));

      console.log('Real iTHB balance:', formattedBalance);

    } catch (err) {
      console.error('Failed to read balances:', err);

      setEthBalance('0');
      setIthbBalance(0);
    }

  } else {
    // Only use fake amounts in Demo Mode
    setEthBalance('0.08');
    setIthbBalance(10000);
  }
  }, [demoMode]);
  useEffect(() => {
  if (address && isConnected && !demoMode) {
    refreshBalances(address);
  }
}, [address, isConnected, demoMode, refreshBalances]);

  // Handle persona change in demo mode
  const switchPersona = (persona: DemoPersona) => {
  setActivePersona(persona);
  localStorage.setItem('interlynk_persona', persona);

  // Only swap wallet addresses when actually using Demo Mode
  if (demoMode) {
    if (persona === 'payer') {
      setAddress(DEMO_PAYER_ADDRESS);
      localStorage.setItem('interlynk_connected_address', DEMO_PAYER_ADDRESS);
    } else if (persona === 'recipient') {
      setAddress(DEMO_RECIPIENT_ADDRESS);
      localStorage.setItem('interlynk_connected_address', DEMO_RECIPIENT_ADDRESS);
    }
  }
};

  // Connect real MetaMask or activate connection
  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (!window.ethereum) {
        // Fallback to demo mode if MetaMask not installed
        setDemoMode(true);
        setIsConnected(true);
        if (!address) {
          setAddress(DEMO_PAYER_ADDRESS);
        }
        localStorage.setItem('interlynk_is_connected', 'true');
        return;
      }

      const accounts = await requestMetaMaskAccounts();
      if (accounts && accounts.length > 0) {
        const selectedAddress = accounts[0];
        setAddress(selectedAddress);
        setIsConnected(true);
        localStorage.setItem('interlynk_connected_address', selectedAddress);
        localStorage.setItem('interlynk_is_connected', 'true');

        const currentChain = await getConnectedChainId();
        setChainId(currentChain);
        await refreshBalances(selectedAddress);
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      if (err.code === 4001) {
        setError('Connection rejected in MetaMask. Please approve the request to continue.');
      } else {
        setError(err.message || 'Failed to connect MetaMask wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    localStorage.setItem('interlynk_is_connected', 'false');
    localStorage.removeItem('interlynk_connected_address');
  };

  const switchNetwork = async () => {
    setError(null);
    try {
      if (window.ethereum) {
        await switchToSepoliaNetwork();
        const cid = await getConnectedChainId();
        setChainId(cid);
      } else {
        // In demo mode, simply switch state
        setChainId(SEPOLIA_CHAIN_ID);
      }
    } catch (err: any) {
      console.error('Network switch failed:', err);
      if (err.code === 4001) {
        setError('Network switch rejected in MetaMask.');
      } else {
        setError('Failed to switch to Ethereum Sepolia network.');
      }
    }
  };

  const addIthbBalance = (amount: number) => {
  if (demoMode) {
    setIthbBalance((prev) => prev + amount);
  }
};

const deductIthbBalance = (amount: number) => {
  if (demoMode) {
    setIthbBalance((prev) => Math.max(0, prev - amount));
  }
};

  const clearError = () => setError(null);

  // Setup MetaMask event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
        localStorage.setItem('interlynk_connected_address', accounts[0]);
        setIsConnected(true);
        refreshBalances(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
  const parsedChainId = parseInt(chainIdHex, 16);
  setChainId(parsedChainId);

  if (address) {
    refreshBalances(address);
  }
};

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Initial chain detection
    getConnectedChainId().then((cid) => {
      if (cid) setChainId(cid);
    });

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [refreshBalances]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        chainId,
        isSepolia,
        ethBalance,
        ithbBalance,
        isMetaMaskInstalled,
        demoMode,
        activePersona,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        setDemoMode,
        switchPersona,
        addIthbBalance,
        deductIthbBalance,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}