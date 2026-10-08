export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  fiatEquivalentSymbol: string;
  fiatRate: number; // 1 iTHB = ฿1
  isTestToken: boolean;
  contractAddress: string;
}

export const ITHB_TOKEN: TokenInfo = {
  name: 'Interlynk Thai Baht',
  symbol: 'iTHB',
  decimals: 18,
  fiatEquivalentSymbol: '฿',
  fiatRate: 1, // 1 iTHB = 1 THB
  isTestToken: true,
  contractAddress: '0x0C0b35b0950Dab7B2D7C413Bd8C0EBeEb52AA2d1',
};

export function formatITHB(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `${num.toLocaleString('en-US', { maximumFractionDigits: 2 })} iTHB`;
}

export function formatTHB(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return `≈ ฿${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}
