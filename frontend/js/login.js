document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const loginFormSection = document.getElementById('loginFormSection');
    const signupFormSection = document.getElementById('signupFormSection');
    const roleSelectionSection = document.getElementById('roleSelectionSection');
    const walletAddressElement = document.getElementById('walletAddress');

    // Show login form when 'Connect Wallet' is clicked
    document.getElementById('connectWalletBtn').addEventListener('click', async () => {
        try {
            // Simulate wallet connection (in a real app, this would connect to MetaMask)
            const mockWalletAddress = "0x" + Math.random().toString(16).substr(2, 40);
            walletAddressElement.textContent = `Connected: ${mockWalletAddress}`;
            
            // Show login form
            loginFormSection.style.display = 'block';
            signupFormSection.style.display = 'none';
            roleSelectionSection.style.display = 'none';
            
            // Store wallet address in localStorage
            localStorage.setItem('walletAddress', mockWalletAddress);
        } catch (error) {
            console.error('Error connecting to wallet:', error);
            alert('Error connecting to wallet. Please try again.');
        }
    });

    // Handle login logic
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const id = document.getElementById('loginId').value.trim();
        const errorElement = document.getElementById('errorLoginMessage');
        
        if (!email) {
            errorElement.textContent = 'Email is required';
            return;
        }
        
        try {
            // Fetch users from our API
            const response = await fetch('/api/users');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            
            const users = await response.json();
            
            // Find the user by email
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (user) {
                // For judges and lawyers, verify ID
                if (user.role === 'judge' && user.id !== id) {
                    errorElement.textContent = 'Invalid Judicial ID';
                    return;
                }
                
                if (user.role === 'lawyer' && user.id !== id) {
                    errorElement.textContent = 'Invalid Bar ID';
                    return;
                }
                
                // Store user in localStorage
                localStorage.setItem('user', JSON.stringify(user));
                
                // Show role selection
                showRoleSelection();
            } else {
                errorElement.textContent = 'User not found';
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorElement.textContent = 'Error logging in. Please try again.';
        }
    });

    // Show role selection after login
    function showRoleSelection() {
        roleSelectionSection.style.display = 'block';
        loginFormSection.style.display = 'none';
        signupFormSection.style.display = 'none';
    }

    // Handle role selection
    document.getElementById('loginAsLawyerBtn').addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'lawyer') {
            // Instead of redirecting to a separate page, we'll set a role in localStorage
            // and reload the page - our single-page app will show the appropriate dashboard
            localStorage.setItem('activeRole', 'lawyer');
            window.location.href = '/'; // Redirect to home page which will show the dashboard
        } else {
            alert('You are not authorized as a lawyer');
        }
    });

    document.getElementById('loginAsJudgeBtn').addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'judge') {
            localStorage.setItem('activeRole', 'judge');
            window.location.href = '/'; // Redirect to home page which will show the dashboard
        } else {
            alert('You are not authorized as a judge');
        }
    });

    document.getElementById('loginAsClientBtn').addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'client') {
            localStorage.setItem('activeRole', 'client');
            window.location.href = '/'; // Redirect to home page which will show the dashboard
        } else {
            alert('You are not authorized as a client');
        }
    });
});
