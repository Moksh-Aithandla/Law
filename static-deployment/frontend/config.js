// Auto-generated configuration file with contract addresses
// Last updated: 2025-05-02T23:09:47.0763059+05:30

// Frontend configuration for E-Vault Law Management System
// This file will be automatically updated by the deployment script

// Contract addresses - will be replaced during deployment
export const userRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const caseManagerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const ipfsManagerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// Network configuration
export const networkConfig = {
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
export const defaultNetwork = 11155111;

// Helper functions
export function getNetworkName(chainId) {
  return networkConfig[chainId]?.name || 'Unknown Network';
}

export function getExplorerUrl(chainId, txHash) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return ${baseUrl}/tx/;
}

export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return ${baseUrl}/address/;
}
