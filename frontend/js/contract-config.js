// contract-config.js - Contract addresses and network configuration
// This file contains the configuration for the Sepolia testnet deployment

// Contract addresses (Mock addresses for testing)
export const CONTRACT_ADDRESSES = {
    UserRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    CaseManager: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    DocumentStorage: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};

// Network configuration
export const NETWORK_CONFIG = {
    chainId: "11155111", // Sepolia testnet
    name: "Sepolia",
    explorer: "https://sepolia.etherscan.io",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/RuOilkGBfCJflqOLZND0WrLWvLFtooRA"
};

// Etherscan URL for transaction tracking
export const SEPOLIA_ETHERSCAN_URL = 'https://sepolia.etherscan.io/tx/';

// Filebase configuration
export const FILEBASE_CONFIG = {
    apiKey: "8C7456690C30D12D749F",
    endpoint: "https://s3.filebase.com",
    bucket: "blockchain-law-documents"
};

// Admin address
export const ADMIN_ADDRESS = "0x13591389EE06948758541b38547a37FB9483F2f4";