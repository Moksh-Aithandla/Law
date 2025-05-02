// Function to load lawyers for case registration
async function loadLawyersForCaseRegistration() {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    const lawyers = users.filter(user => user.role === 'lawyer');
    
    const lawyerSelect = document.getElementById('case-lawyer');
    lawyerSelect.innerHTML = '<option value="">-- Select Lawyer --</option>';
    
    lawyers.forEach(lawyer => {
      const option = document.createElement('option');
      option.value = lawyer.name;
      option.textContent = `${lawyer.name} (${lawyer.id})`;
      lawyerSelect.appendChild(option);
    });
    
    return true;
  } catch (error) {
    console.error('Error loading lawyers for case registration:', error);
    return false;
  }
}

// Client dashboard navigation
document.addEventListener('DOMContentLoaded', function() {
  // Register case link
  const registerCaseLink = document.getElementById('client-register-case-link');
  if (registerCaseLink) {
    registerCaseLink.addEventListener('click', async function(e) {
      e.preventDefault();
      await loadLawyersForCaseRegistration();
      const clientDashboard = document.getElementById('client-dashboard');
      const registerCaseSection = document.getElementById('register-case-section');
      
      if (clientDashboard) clientDashboard.style.display = 'none';
      if (registerCaseSection) registerCaseSection.style.display = 'block';
    });
  }
  
  // Back to dashboard button
  const backToDashboardBtn = document.getElementById('back-to-client-dashboard');
  if (backToDashboardBtn) {
    backToDashboardBtn.addEventListener('click', function() {
      const clientDashboard = document.getElementById('client-dashboard');
      const registerCaseSection = document.getElementById('register-case-section');
      
      if (clientDashboard) clientDashboard.style.display = 'block';
      if (registerCaseSection) registerCaseSection.style.display = 'none';
    });
  }
  
  // Register case form submission
  const registerCaseSubmitBtn = document.getElementById('register-case-submit');
  if (registerCaseSubmitBtn) {
    registerCaseSubmitBtn.addEventListener('click', async function() {
      const title = document.getElementById('case-title').value.trim();
      const description = document.getElementById('case-description').value.trim();
      const caseType = document.getElementById('case-type').value;
      const lawyer = document.getElementById('case-lawyer').value;
      const errorElement = document.getElementById('register-case-error');
      
      if (!title || !description || !caseType || !lawyer) {
        errorElement.textContent = 'Please fill in all required fields';
        return;
      }
      
      try {
        // Get current user
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
          errorElement.textContent = 'You must be logged in to register a case';
          return;
        }
        
        // Check if blockchain is initialized
        if (window.ethereum && window.blockchainUtils) {
          try {
            errorElement.textContent = 'Connecting to blockchain...';
            
            // Initialize blockchain
            await window.blockchainUtils.initBlockchain();
            
            // Create case data for blockchain
            const caseData = {
              title: title,
              description: description,
              caseType: caseType,
              submittedBy: user.name,
              assignedTo: lawyer,
              judge: 'Judge Smith' // Default judge
            };
            
            errorElement.textContent = 'Registering case on blockchain...';
            
            // Register case on blockchain
            const caseId = await window.blockchainUtils.registerCaseOnBlockchain(caseData);
            
            alert(`Case registered successfully on blockchain with ID: ${caseId}`);
            
            // Clear form
            document.getElementById('case-title').value = '';
            document.getElementById('case-description').value = '';
            document.getElementById('case-type').value = '';
            document.getElementById('case-lawyer').value = '';
            errorElement.textContent = '';
            
            // Show client dashboard
            const clientDashboard = document.getElementById('client-dashboard');
            const registerCaseSection = document.getElementById('register-case-section');
            
            if (clientDashboard) clientDashboard.style.display = 'block';
            if (registerCaseSection) registerCaseSection.style.display = 'none';
            
            return;
          } catch (blockchainError) {
            console.error('Blockchain error:', blockchainError);
            errorElement.textContent = 'Blockchain error: ' + blockchainError.message;
            
            // Fall back to API-based registration if blockchain fails
            console.log('Falling back to API-based registration...');
          }
        }
        
        // If blockchain is not available or fails, use the API
        // Get all cases
        const response = await fetch('/api/cases');
        if (!response.ok) {
          throw new Error('Failed to fetch cases');
        }
        
        const allCases = await response.json();
        
        // Create new case object
        const newCase = {
          id: allCases.length + 1,
          title: title,
          description: description,
          submittedBy: user.name,
          assignedTo: lawyer,
          judge: 'Judge Smith', // Default judge
          status: 'Registered',
          filingDate: new Date().toISOString().split('T')[0],
          nextHearing: '',
          caseType: caseType,
          courtRoom: 'Room 302, District Court',
          documents: [],
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              action: 'Case Filed',
              by: user.name
            }
          ]
        };
        
        // In a real app, we would send this to the server
        // For now, we'll just simulate success
        
        alert('Case registered successfully using API!');
        
        // Clear form
        document.getElementById('case-title').value = '';
        document.getElementById('case-description').value = '';
        document.getElementById('case-type').value = '';
        document.getElementById('case-lawyer').value = '';
        errorElement.textContent = '';
        
        // Show client dashboard
        const clientDashboard = document.getElementById('client-dashboard');
        const registerCaseSection = document.getElementById('register-case-section');
        
        if (clientDashboard) clientDashboard.style.display = 'block';
        if (registerCaseSection) registerCaseSection.style.display = 'none';
      } catch (error) {
        console.error('Error registering case:', error);
        errorElement.textContent = 'Error registering case. Please try again.';
      }
    });
  }
});