// Auto-generated configuration file with contract addresses
// Last updated: 2025-04-30T14:36:04.082Z

// Frontend configuration for E-Vault Law Management System
// This file will be automatically updated by the deployment script

// Contract addresses - will be replaced during deployment
export const userRegistryAddress = "0x340b42850B5186c72CDf7eaC3250CCf8EFDecd75";
export const caseManagerAddress = "0x5d2c12b8f3CdB26db3584bCfF03623A8F54D8708";
export const ipfsManagerAddress = "0xf7F882fF395bA3D25F889841c80c2E24270E90da";

// Network configuration
export const networkConfig = {
  // For local development (Hardhat)
  31337: {
    name: 'Localhost',
    explorer: 'https://etherscan.io',
    rpcUrl: 'http://localhost:8545'
  },
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
  return `${baseUrl}/tx/${txHash}`;
}

export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
}
