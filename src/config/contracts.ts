export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_HEX = '0xaa36a7';

export const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_HEX,
  chainName: 'Ethereum Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia.publicnode.com',
    'https://sepolia.gateway.tenderly.co',
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Configurable contract addresses (defaults to standard prototype addresses on Sepolia)
export const CONTRACT_ADDRESSES = {
  iTHBToken: '0x0C0b35b0950Dab7B2D7C413Bd8C0EBeEb52AA2d1',
  interlynkEscrow: '0xCC8f82718157f4685bb93DD29df328beB4950C28',
};

// Standard ERC-20 Token ABI
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// Interlynk Escrow Contract ABI
export const ESCROW_ABI = [
  'function createEscrow(address recipient, uint256 amount, string releaseCondition, uint256 deadline) returns (uint256)',
  'function depositTokens(uint256 escrowId)',
  'function markWorkSubmitted(uint256 escrowId, string deliverableUri)',
  'function releaseFunds(uint256 escrowId)',
  'function cancelEscrow(uint256 escrowId)',
  'function refundEscrow(uint256 escrowId)',

  'function getEscrow(uint256 escrowId) view returns (address payer, address recipient, uint256 amount, uint8 status, uint256 deadline, string releaseCondition)',
  'function getDeliverable(uint256 escrowId) view returns (string)',

  'function escrowCount() view returns (uint256)',
  'function token() view returns (address)',

  'event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed recipient, uint256 amount)',
  'event FundsDeposited(uint256 indexed escrowId, uint256 amount)',
  'event WorkSubmitted(uint256 indexed escrowId, string deliverableUri)',
  'event FundsReleased(uint256 indexed escrowId, address indexed recipient, uint256 amount)',
  'event EscrowCancelled(uint256 indexed escrowId)',
  'event EscrowRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount)',
];
