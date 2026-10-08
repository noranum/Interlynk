import { BrowserProvider, formatEther, isAddress } from 'ethers';
import { SEPOLIA_CHAIN_ID, SEPOLIA_CONFIG } from '../config/contracts';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum && window.ethereum.isMetaMask);
}

export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return isAddress(address.trim());
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export async function requestMetaMaskAccounts(): Promise<string[]> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  return accounts as string[];
}

export async function getConnectedChainId(): Promise<number | null> {
  if (!window.ethereum) return null;
  try {
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainIdHex, 16);
  } catch (error) {
    console.error('Error getting chainId:', error);
    return null;
  }
}

export async function switchToSepoliaNetwork(): Promise<boolean> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CONFIG.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_CONFIG],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Sepolia network:', addError);
        throw addError;
      }
    }
    console.error('Failed to switch to Sepolia:', switchError);
    throw switchError;
  }
}

export async function getEthBalance(address: string): Promise<string> {
  if (!window.ethereum || !address) return '0.00';
  try {
    const provider = new BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    const formatted = formatEther(balance);
    const num = parseFloat(formatted);
    return num.toFixed(4);
  } catch (err) {
    console.warn('Could not fetch real ETH balance, using default:', err);
    return '0.08';
  }
}

export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function getEtherscanTxUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function getEtherscanAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}
