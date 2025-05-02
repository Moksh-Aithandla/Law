/**
 * MetaMask Connection Test Script
 * This script tests the connection to MetaMask and displays the results
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  const testResultsElement = document.getElementById('test-results');
  
  if (!testResultsElement) {
    console.error('Test results element not found');
    return;
  }
  
  // Add test result
  function addResult(test, result, details = '') {
    const resultElement = document.createElement('div');
    resultElement.className = `test-result ${result ? 'success' : 'failure'}`;
    resultElement.innerHTML = `
      <div class="test-name">${test}</div>
      <div class="test-status">${result ? 'PASS' : 'FAIL'}</div>
      ${details ? `<div class="test-details">${details}</div>` : ''}
    `;
    testResultsElement.appendChild(resultElement);
    return result;
  }
  
  // Run tests
  async function runTests() {
    testResultsElement.innerHTML = '<h3>Running MetaMask Connection Tests...</h3>';
    
    // Test 1: Check if MetaMask is installed
    const isMetaMaskInstalled = typeof window.ethereum !== 'undefined';
    addResult('MetaMask Installation', isMetaMaskInstalled, 
      isMetaMaskInstalled 
        ? 'MetaMask is installed' 
        : 'MetaMask is not installed. Please install MetaMask extension.'
    );
    
    if (!isMetaMaskInstalled) {
      addResult('Overall Status', false, 'MetaMask is required for this application to work.');
      return;
    }
    
    // Test 2: Check if we can access ethereum provider
    let providerAccessible = false;
    try {
      const provider = window.ethereum;
      providerAccessible = !!provider;
      addResult('Ethereum Provider Access', providerAccessible, 
        providerAccessible 
          ? 'Ethereum provider is accessible' 
          : 'Cannot access Ethereum provider'
      );
    } catch (error) {
      addResult('Ethereum Provider Access', false, `Error accessing provider: ${error.message}`);
    }
    
    if (!providerAccessible) {
      addResult('Overall Status', false, 'Cannot access Ethereum provider. Please check your MetaMask installation.');
      return;
    }
    
    // Test 3: Check if we can get accounts (without requesting)
    let accountsAccessible = false;
    let accounts = [];
    try {
      accounts = await window.ethereum.request({ method: 'eth_accounts' });
      accountsAccessible = true;
      addResult('Accounts Access', accountsAccessible, 
        accounts.length > 0 
          ? `Connected account: ${accounts[0]}` 
          : 'No accounts connected yet (this is normal if you haven\'t connected)'
      );
    } catch (error) {
      addResult('Accounts Access', false, `Error accessing accounts: ${error.message}`);
    }
    
    // Test 4: Check if we can get chain ID
    let chainIdAccessible = false;
    let chainId = null;
    try {
      chainId = await window.ethereum.request({ method: 'eth_chainId' });
      chainIdAccessible = true;
      const chainIdDecimal = parseInt(chainId, 16);
      addResult('Chain ID Access', chainIdAccessible, `Current chain ID: ${chainId} (${chainIdDecimal})`);
    } catch (error) {
      addResult('Chain ID Access', false, `Error accessing chain ID: ${error.message}`);
    }
    
    // Test 5: Try to request accounts (will prompt user)
    const connectButton = document.getElementById('connect-test-button');
    if (connectButton) {
      connectButton.style.display = 'block';
      connectButton.addEventListener('click', async () => {
        try {
          connectButton.disabled = true;
          connectButton.textContent = 'Connecting...';
          
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          addResult('Connection Request', true, `Successfully connected to account: ${accounts[0]}`);
          
          // Check if we can get chain ID again
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const chainIdDecimal = parseInt(chainId, 16);
          
          // Check if we're on Sepolia (11155111)
          const isOnSepolia = chainIdDecimal === 11155111;
          addResult('Sepolia Network', isOnSepolia, 
            isOnSepolia 
              ? 'Connected to Sepolia network' 
              : `Connected to network with chain ID ${chainIdDecimal}. Please switch to Sepolia (Chain ID: 11155111)`
          );
          
          // Try to switch to Sepolia if not already on it
          if (!isOnSepolia) {
            const switchButton = document.createElement('button');
            switchButton.textContent = 'Switch to Sepolia';
            switchButton.className = 'btn btn-primary';
            switchButton.onclick = async () => {
              try {
                switchButton.disabled = true;
                switchButton.textContent = 'Switching...';
                
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
                });
                
                addResult('Network Switch', true, 'Successfully switched to Sepolia network');
                switchButton.remove();
                
                // Reload the page to reflect the new network
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              } catch (error) {
                addResult('Network Switch', false, `Error switching network: ${error.message}`);
                switchButton.disabled = false;
                switchButton.textContent = 'Switch to Sepolia';
              }
            };
            testResultsElement.appendChild(switchButton);
          }
          
          // Overall status
          addResult('Overall Status', true, 'MetaMask is working correctly!');
          
        } catch (error) {
          addResult('Connection Request', false, `Error requesting accounts: ${error.message}`);
          addResult('Overall Status', false, 'Could not connect to MetaMask. Please try again.');
        } finally {
          connectButton.disabled = false;
          connectButton.textContent = 'Connect MetaMask';
        }
      });
    }
    
    // Add overall status if we haven't prompted for connection
    if (accounts.length === 0) {
      addResult('Overall Status', null, 'Click "Connect MetaMask" to complete the test.');
    } else {
      // We already have accounts, so we're connected
      const chainIdDecimal = parseInt(chainId, 16);
      const isOnSepolia = chainIdDecimal === 11155111;
      addResult('Sepolia Network', isOnSepolia, 
        isOnSepolia 
          ? 'Connected to Sepolia network' 
          : `Connected to network with chain ID ${chainIdDecimal}. Please switch to Sepolia (Chain ID: 11155111)`
      );
      
      addResult('Overall Status', isOnSepolia, 
        isOnSepolia 
          ? 'MetaMask is working correctly!' 
          : 'Please switch to Sepolia network'
      );
    }
  }
  
  // Run tests
  runTests();
});