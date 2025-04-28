@echo off
echo E-Vault Law Management System Setup
echo ===================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo npm is installed.
echo.

REM Create .env file with credentials
echo Creating .env file with credentials...
(
echo SEPOLIA_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/RuOilkGBfCJflqOLZND0WrLWvLFtooRA
echo AMOY_ALCHEMY_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/w3TJuB1ukvyx3BLk351wmgyu0B-XvEfR
echo MORPH_TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
echo METAMASK_PRIVATE_KEY=06fe5cf665ced25f071ef6d237c21b1f36222605c2822135839aec503006b4f0
echo ETHERSCAN_API_KEY=TZDQ2M9NQTTV9689P9KBQEJ86FECXVDTRX
) > .env

echo .env file created.
echo.

REM Install dependencies
echo Installing dependencies...
call npm init -y
call npm install express dotenv ethers@5.7.2 @truffle/hdwallet-provider ipfs-http-client web3 @openzeppelin/contracts

echo.
echo Dependencies installed.
echo.

REM Create Truffle configuration
echo Creating Truffle configuration...
if not exist truffle-config.js (
    (
    echo const HDWalletProvider = require('@truffle/hdwallet-provider');
    echo const dotenv = require('dotenv');
    echo dotenv.config();
    echo.
    echo module.exports = {
    echo   networks: {
    echo     development: {
    echo       host: "127.0.0.1",
    echo       port: 8545,
    echo       network_id: "*"
    echo     },
    echo     sepolia: {
    echo       provider: () =^> new HDWalletProvider(
    echo         process.env.METAMASK_PRIVATE_KEY,
    echo         process.env.SEPOLIA_ALCHEMY_RPC_URL
    echo       ),
    echo       network_id: 11155111,
    echo       gas: 5500000,
    echo       confirmations: 2,
    echo       timeoutBlocks: 200,
    echo       skipDryRun: true
    echo     }
    echo   },
    echo   compilers: {
    echo     solc: {
    echo       version: "0.8.17",
    echo       settings: {
    echo         optimizer: {
    echo           enabled: true,
    echo           runs: 200
    echo         }
    echo       }
    echo     }
    echo   },
    echo   plugins: ['truffle-plugin-verify'],
    echo   api_keys: {
    echo     etherscan: process.env.ETHERSCAN_API_KEY
    echo   }
    echo };
    ) > truffle-config.js
)

echo Truffle configuration created.
echo.

REM Create migrations directory and deployment script if they don't exist
if not exist migrations mkdir migrations
if not exist migrations\1_deploy_contracts.js (
    (
    echo const EVaultLaw = artifacts.require("EVaultLaw");
    echo.
    echo module.exports = function(deployer) {
    echo   deployer.deploy(EVaultLaw);
    echo };
    ) > migrations\1_deploy_contracts.js
)

echo Migration scripts created.
echo.

REM Create deployment script
echo Creating deployment script...
(
echo const HDWalletProvider = require('@truffle/hdwallet-provider');
echo const Web3 = require('web3');
echo const { abi, bytecode } = require('./build/contracts/EVaultLaw.json');
echo const dotenv = require('dotenv');
echo dotenv.config();
echo.
echo async function deploy() {
echo   const provider = new HDWalletProvider(
echo     process.env.METAMASK_PRIVATE_KEY,
echo     process.env.SEPOLIA_ALCHEMY_RPC_URL
echo   );
echo.
echo   const web3 = new Web3(provider);
echo   const accounts = await web3.eth.getAccounts();
echo.
echo   console.log('Attempting to deploy from account', accounts[0]);
echo.
echo   const contract = new web3.eth.Contract(abi);
echo   const deployTx = contract.deploy({ data: bytecode });
echo.
echo   const gas = await deployTx.estimateGas();
echo   console.log('Estimated gas:', gas);
echo.
echo   const deployedContract = await deployTx
echo     .send({
echo       from: accounts[0],
echo       gas
echo     })
echo     .on('transactionHash', hash => {
echo       console.log('Transaction hash:', hash);
echo       console.log('View on Etherscan:', `https://sepolia.etherscan.io/tx/${hash}`);
echo     })
echo     .on('confirmation', (confirmationNumber, receipt) => {
echo       console.log('Confirmation number:', confirmationNumber);
echo     });
echo.
echo   console.log('Contract deployed to:', deployedContract.options.address);
echo   console.log('View contract on Etherscan:', `https://sepolia.etherscan.io/address/${deployedContract.options.address}`);
echo.
echo   // Update the CONTRACT_ADDRESS in blockchain.js
echo   const fs = require('fs');
echo   const blockchainJsPath = './frontend/js/blockchain.js';
echo   let blockchainJs = fs.readFileSync(blockchainJsPath, 'utf8');
echo   blockchainJs = blockchainJs.replace(
echo     /const CONTRACT_ADDRESS = '0x[a-fA-F0-9]{40}'/,
echo     `const CONTRACT_ADDRESS = '${deployedContract.options.address}'`
echo   );
echo   fs.writeFileSync(blockchainJsPath, blockchainJs);
echo.
echo   console.log('Updated CONTRACT_ADDRESS in blockchain.js');
echo   provider.engine.stop();
echo }
echo.
echo deploy().then(() => process.exit(0)).catch(err => {
echo   console.error(err);
echo   process.exit(1);
echo });
) > deploy.js

echo Deployment script created.
echo.

REM Create compile and deploy batch file
echo Creating compile and deploy batch file...
(
echo @echo off
echo echo Compiling smart contracts...
echo call npx truffle compile
echo.
echo echo Deploying to Sepolia testnet...
echo node deploy.js
echo.
echo pause
) > deploy-contract.bat

echo Compile and deploy batch file created.
echo.

REM Ask if user wants to deploy the contract
echo Do you want to deploy the smart contract to Sepolia testnet? (Y/N)
set /p deploy_choice=

if /i "%deploy_choice%"=="Y" (
    echo Compiling and deploying smart contract...
    call npx truffle compile
    node deploy.js
)

REM Start the server
echo Starting the server...
node simple-server.js