// Auto-generated contract configuration file
// Last updated: 2025-04-30T14:36:04.085Z

// Contract addresses
export const CONTRACT_ADDRESSES = {
  UserRegistry: "undefined",
  CaseManager: "undefined",
  IPFSManager: "undefined"
};

// Network configuration
export const NETWORKS = {
  // For local development (Hardhat)
  31337: {
    name: 'Localhost',
    explorer: 'https://etherscan.io',
    rpcUrl: 'http://localhost:8545'
  },
  // For Sepolia testnet
  11155111: {
    name: 'Sepolia',
    explorer: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://sepolia.infura.io/v3/'
  }
};

// Default network
export const DEFAULT_NETWORK = 11155111;

// Function to get network name
export function getNetworkName(chainId) {
  return NETWORKS[chainId]?.name || 'Unknown Network';
}

// Function to get explorer URL for a transaction
export function getExplorerUrl(chainId, txHash) {
  const baseUrl = NETWORKS[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
}

// Function to get explorer URL for an address
export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = NETWORKS[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
}
