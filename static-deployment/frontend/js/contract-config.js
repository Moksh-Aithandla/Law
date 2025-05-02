// Auto-generated contract configuration file
// Last updated: 2025-05-02T23:09:47.0930086+05:30

// Contract addresses
export const CONTRACT_ADDRESSES = {
  UserRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  CaseManager: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  IPFSManager: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};

// Network configuration
export const NETWORKS = {
  // For Ganache local development
  1337: {
    name: 'Ganache',
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
  return ${baseUrl}/tx/;
}

// Function to get explorer URL for an address
export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = NETWORKS[chainId]?.explorer || 'https://etherscan.io';
  return ${baseUrl}/address/;
}
