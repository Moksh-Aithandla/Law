// Script to update frontend configuration with deployed contract addresses
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.cyan('=================================================='));
console.log(chalk.cyan('E-Vault Law System - Frontend Configuration Update'));
console.log(chalk.cyan('=================================================='));
console.log('');

// Get the root directory of the project
const rootDir = path.resolve(__dirname);

// Path to deployed addresses JSON file
const deployedAddressesPath = path.join(rootDir, 'deployed-addresses.json');

// Path to frontend config file
const frontendConfigPath = path.join(rootDir, 'frontend', 'config.js');

// Path to ABI directory
const abiDir = path.join(rootDir, 'frontend', 'abi');

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(chalk.green(`Created directory: ${dirPath}`));
  }
}

// Function to copy contract ABIs
function copyContractABIs() {
  console.log(chalk.yellow('Copying contract ABIs to frontend...'));
  
  try {
    // Ensure ABI directory exists
    ensureDirectoryExists(abiDir);
    
    // Source paths for contract artifacts
    const userRegistryArtifactPath = path.join(rootDir, 'backend', 'artifacts', 'backend', 'contracts', 'UserRegistry.sol', 'UserRegistry.json');
    const caseManagerArtifactPath = path.join(rootDir, 'backend', 'artifacts', 'backend', 'contracts', 'CaseManager.sol', 'CaseManager.json');
    const ipfsManagerArtifactPath = path.join(rootDir, 'backend', 'artifacts', 'backend', 'contracts', 'IPFSManager.sol', 'IPFSManager.json');
    
    // Destination paths
    const userRegistryABIPath = path.join(abiDir, 'UserRegistry.json');
    const caseManagerABIPath = path.join(abiDir, 'CaseManager.json');
    const ipfsManagerABIPath = path.join(abiDir, 'IPFSManager.json');
    
    // Copy files if they exist
    if (fs.existsSync(userRegistryArtifactPath)) {
      fs.copyFileSync(userRegistryArtifactPath, userRegistryABIPath);
      console.log(chalk.green(`Copied UserRegistry ABI to ${userRegistryABIPath}`));
    } else {
      console.warn(chalk.yellow(`Warning: UserRegistry artifact not found at ${userRegistryArtifactPath}`));
    }
    
    if (fs.existsSync(caseManagerArtifactPath)) {
      fs.copyFileSync(caseManagerArtifactPath, caseManagerABIPath);
      console.log(chalk.green(`Copied CaseManager ABI to ${caseManagerABIPath}`));
    } else {
      console.warn(chalk.yellow(`Warning: CaseManager artifact not found at ${caseManagerArtifactPath}`));
    }
    
    if (fs.existsSync(ipfsManagerArtifactPath)) {
      fs.copyFileSync(ipfsManagerArtifactPath, ipfsManagerABIPath);
      console.log(chalk.green(`Copied IPFSManager ABI to ${ipfsManagerABIPath}`));
    } else {
      console.warn(chalk.yellow(`Warning: IPFSManager artifact not found at ${ipfsManagerArtifactPath}`));
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red(`Error copying contract ABIs: ${error.message}`));
    return false;
  }
}

// Function to update frontend configuration
function updateFrontendConfig() {
  console.log(chalk.yellow('Updating frontend configuration...'));
  
  try {
    // Check if deployed-addresses.json exists
    if (!fs.existsSync(deployedAddressesPath)) {
      console.error(chalk.red('Error: deployed-addresses.json not found'));
      console.log(chalk.yellow('Creating a placeholder configuration with default Sepolia addresses...'));
      
      // Create a placeholder configuration with default Sepolia addresses
      const placeholderAddresses = {
        UserRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        CaseManager: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        IPFSManager: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
      };
      
      // Write placeholder addresses to file
      fs.writeFileSync(deployedAddressesPath, JSON.stringify(placeholderAddresses, null, 2));
      console.log(chalk.green(`Created placeholder deployed-addresses.json`));
    }
    
    // Read deployed contract addresses
    const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
    
    // Ensure frontend directory exists
    ensureDirectoryExists(path.join(rootDir, 'frontend'));
    
    // Determine which network we're using
    const isSepoliaDeployment = process.argv.includes('--sepolia');
    const isGanacheDeployment = process.argv.includes('--ganache');
    
    let defaultNetwork;
    if (isSepoliaDeployment) {
        defaultNetwork = 11155111; // Sepolia
    } else if (isGanacheDeployment) {
        defaultNetwork = 1337;     // Ganache
    } else {
        defaultNetwork = 31337;    // Hardhat
    }
    
    // Update frontend/config.js
    const configContent = `// Auto-generated configuration file with contract addresses
// Last updated: ${new Date().toISOString()}

// Frontend configuration for E-Vault Law Management System
// This file will be automatically updated by the deployment script

// Contract addresses - will be replaced during deployment
export const userRegistryAddress = "${deployedAddresses.UserRegistry}";
export const caseManagerAddress = "${deployedAddresses.CaseManager}";
export const ipfsManagerAddress = "${deployedAddresses.IPFSManager}";

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
export const defaultNetwork = ${defaultNetwork};

// Helper functions
export function getNetworkName(chainId) {
  return networkConfig[chainId]?.name || 'Unknown Network';
}

export function getExplorerUrl(chainId, txHash) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return \`\${baseUrl}/tx/\${txHash}\`;
}

export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = networkConfig[chainId]?.explorer || 'https://etherscan.io';
  return \`\${baseUrl}/address/\${address}\`;
}
`;
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log(chalk.green(`Updated frontend config at ${frontendConfigPath}`));
    
    // Create contract-config.js for easier imports
    const contractConfigPath = path.join(rootDir, 'frontend', 'js', 'contract-config.js');
    
    // Ensure js directory exists
    ensureDirectoryExists(path.join(rootDir, 'frontend', 'js'));
    
    // Ensure css directory exists
    ensureDirectoryExists(path.join(rootDir, 'frontend', 'css'));
    
    const contractConfigContent = `// Auto-generated contract configuration file
// Last updated: ${new Date().toISOString()}

// Contract addresses
export const CONTRACT_ADDRESSES = {
  UserRegistry: "${deployedAddresses.UserRegistry}",
  CaseManager: "${deployedAddresses.CaseManager}",
  IPFSManager: "${deployedAddresses.IPFSManager}"
};

// Network configuration
export const NETWORKS = {
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
export const DEFAULT_NETWORK = ${defaultNetwork};

// Function to get network name
export function getNetworkName(chainId) {
  return NETWORKS[chainId]?.name || 'Unknown Network';
}

// Function to get explorer URL for a transaction
export function getExplorerUrl(chainId, txHash) {
  const baseUrl = NETWORKS[chainId]?.explorer || 'https://etherscan.io';
  return \`\${baseUrl}/tx/\${txHash}\`;
}

// Function to get explorer URL for an address
export function getAddressExplorerUrl(chainId, address) {
  const baseUrl = NETWORKS[chainId]?.explorer || 'https://etherscan.io';
  return \`\${baseUrl}/address/\${address}\`;
}
`;
    
    fs.writeFileSync(contractConfigPath, contractConfigContent);
    console.log(chalk.green(`Created contract config at ${contractConfigPath}`));
    
    return true;
  } catch (error) {
    console.error(chalk.red(`Error updating frontend configuration: ${error.message}`));
    return false;
  }
}

// Copy contract ABIs
const abisCopied = copyContractABIs();

// Update frontend configuration
const configUpdated = updateFrontendConfig();

if (abisCopied && configUpdated) {
  console.log('');
  console.log(chalk.green('=================================================='));
  console.log(chalk.green('Frontend configuration updated successfully!'));
  console.log(chalk.green('=================================================='));
  
  // Log network information
  const isSepoliaDeployment = process.argv.includes('--sepolia');
  if (isSepoliaDeployment) {
    console.log(chalk.cyan('Network: Sepolia Testnet'));
    console.log(chalk.cyan('Explorer: https://sepolia.etherscan.io'));
  } else {
    console.log(chalk.cyan('Network: Localhost (Hardhat)'));
    console.log(chalk.cyan('RPC URL: http://localhost:8545'));
  }
  
  process.exit(0);
} else {
  console.log('');
  console.log(chalk.red('=================================================='));
  console.log(chalk.red('Frontend configuration update failed!'));
  console.log(chalk.red('=================================================='));
  process.exit(1);
}