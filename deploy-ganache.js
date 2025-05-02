// Simple script to deploy contracts to Ganache
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('===================================================');
console.log('E-Vault Law Management System - Ganache Deployment');
console.log('===================================================');
console.log('');

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, { 
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Main deployment function
async function deploy() {
  try {
    // Step 1: Start Ganache (in a separate window)
    console.log('Step 1: Starting Ganache...');
    const ganache = spawn('npx', ['ganache', '--port', '8545', '--chain.chainId', '1337', '--wallet.deterministic'], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    
    // Unref the child process so it can run independently
    ganache.unref();
    
    console.log('Ganache started in a separate window.');
    console.log('Waiting for Ganache to initialize...');
    
    // Wait for Ganache to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 2: Deploy contracts to Ganache
    console.log('\nStep 2: Deploying contracts to Ganache...');
    await runCommand('npx', ['hardhat', 'run', 'backend/scripts/deploy-admin.js', '--network', 'ganache']);
    
    // Step 3: Update frontend configuration
    console.log('\nStep 3: Updating frontend configuration...');
    await runCommand('node', ['new-update-frontend-config.js', '--ganache']);
    
    // Step 4: Start the web server (in a separate window)
    console.log('\nStep 4: Starting web server...');
    const server = spawn('node', ['server.js'], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    
    // Unref the child process so it can run independently
    server.unref();
    
    console.log('Web server started in a separate window.');
    console.log('Waiting for server to initialize...');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 5: Open the application in the browser
    console.log('\nStep 5: Opening application in browser...');
    const start = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    spawn(start, ['http://localhost:3000'], { shell: true });
    
    console.log('\n===================================================');
    console.log('E-Vault Law Management System is now running!');
    console.log('===================================================');
    console.log('');
    console.log('The system is running with:');
    console.log('- Ganache: http://localhost:8545 (Chain ID: 1337)');
    console.log('- Web Server: http://localhost:3000');
    console.log('');
    console.log('To stop the system, close the Ganache and Web Server windows.');
    console.log('');
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the deployment
deploy();