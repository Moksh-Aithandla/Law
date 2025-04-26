require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./backend/.env" });

const SEPOLIA_RPC_URL = process.env.ALCHEMY_API_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      // For testing with initial data, we need more accounts
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000" // 10000 ETH
      }
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 10_000_000_000, // 10 Gwei
      gas: 3_000_000,           // Gas limit for deployment
    },
  },
  paths: {
    sources: "./backend/contracts",
    tests: "./backend/test",
    cache: "./backend/cache",
    artifacts: "./backend/artifacts"
  }
};
