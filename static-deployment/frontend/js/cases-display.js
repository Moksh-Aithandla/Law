// Function to load all cases
async function loadAllCases() {
  try {
    // Try to load cases from blockchain first
    if (window.ethereum && window.blockchainUtils) {
      try {
        console.log('Attempting to load cases from blockchain...');
        await window.blockchainUtils.initBlockchain();
        const blockchainCases = await window.blockchainUtils.getAllCasesFromBlockchain();
        console.log('Loaded cases from blockchain:', blockchainCases.length);
        return blockchainCases;
      } catch (blockchainError) {
        console.error('Error loading cases from blockchain:', blockchainError);
        console.log('Falling back to API...');
      }
    }
    
    // Fall back to API if blockchain fails or is not available
    const response = await fetch('/api/cases');
    if (!response.ok) {
      throw new Error('Failed to fetch cases');
    }
    
    const allCases = await response.json();
    console.log('Loaded cases from API:', allCases.length);
    return allCases;
  } catch (error) {
    console.error('Error loading cases:', error);
    return [];
  }
}

// Function to display all cases
async function displayAllCases() {
  const allCases = await loadAllCases();
  const casesBody = document.getElementById('all-cases-body');
  
  if (!casesBody) return;
  
  casesBody.innerHTML = '';
  
  allCases.forEach(c => {
    const row = document.createElement('tr');
    
    // Case ID
    const idCell = document.createElement('td');
    idCell.textContent = c.id;
    row.appendChild(idCell);
    
    // Title
    const titleCell = document.createElement('td');
    titleCell.textContent = c.title;
    row.appendChild(titleCell);
    
    // Status
    const statusCell = document.createElement('td');
    const statusSpan = document.createElement('span');
    statusSpan.textContent = c.status;
    statusSpan.className = `status status-${c.status.toLowerCase().replace(' ', '-')}`;
    statusCell.appendChild(statusSpan);
    row.appendChild(statusCell);
    
    // Filed By
    const filedByCell = document.createElement('td');
    filedByCell.textContent = c.submittedBy;
    row.appendChild(filedByCell);
    
    // Assigned To
    const assignedToCell = document.createElement('td');
    assignedToCell.textContent = c.assignedTo;
    row.appendChild(assignedToCell);
    
    // Judge
    const judgeCell = document.createElement('td');
    judgeCell.textContent = c.judge;
    row.appendChild(judgeCell);
    
    // Actions
    const actionsCell = document.createElement('td');
    const viewButton = document.createElement('button');
    viewButton.textContent = 'View Details';
    viewButton.className = 'btn';
    viewButton.style.padding = '0.25rem 0.5rem';
    viewButton.style.fontSize = '0.875rem';
    viewButton.addEventListener('click', function() {
      displayCaseDetails(c);
      
      // Hide all sections
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show case details section
      const caseDetailsSection = document.getElementById('case-details-section');
      if (caseDetailsSection) {
        caseDetailsSection.style.display = 'block';
      }
    });
    actionsCell.appendChild(viewButton);
    row.appendChild(actionsCell);
    
    casesBody.appendChild(row);
  });
  
  // Add search functionality
  const caseSearch = document.getElementById('case-search');
  if (caseSearch) {
    caseSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const rows = casesBody.getElementsByTagName('tr');
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const text = row.textContent.toLowerCase();
        
        if (text.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      }
    });
  }
}

// Helper function to get appropriate file icon based on document type
function getFileIcon(documentType) {
  if (!documentType) return 'alt';
  
  const type = documentType.toLowerCase();
  if (type === 'pdf') return 'pdf';
  if (type === 'doc' || type === 'docx') return 'word';
  if (type === 'xls' || type === 'xlsx') return 'excel';
  if (type === 'ppt' || type === 'pptx') return 'powerpoint';
  if (type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'gif') return 'image';
  if (type === 'txt') return 'text';
  return 'alt';
}

// Function to display case details
function displayCaseDetails(caseData) {
  const detailsContent = document.getElementById('case-details-content');
  if (!detailsContent) return;
  
  let documentsHtml = '';
  if (caseData.documents && caseData.documents.length > 0) {
    documentsHtml = `
      <h3>Documents</h3>
      <ul id="case-documents-list" class="document-list">
        ${caseData.documents.map(doc => `
          <li class="document-item">
            <i class="fas fa-file-${getFileIcon(doc.documentType)}"></i>
            <span>${doc.name}</span>
            <span class="document-date">Uploaded by: ${doc.uploadedBy} on ${doc.uploadDate}</span>
            <div class="document-actions">
              <a href="${doc.url}" target="_blank" class="btn btn-small">View</a>
              <a href="${doc.etherscanUrl}" target="_blank" class="btn btn-small btn-etherscan">
                <i class="fas fa-external-link-alt"></i> Etherscan
              </a>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  } else {
    documentsHtml = `
      <h3>Documents</h3>
      <ul id="case-documents-list" class="document-list">
        <li>No documents available for this case</li>
      </ul>
    `;
  }
  
  let historyHtml = '';
  if (caseData.history && caseData.history.length > 0) {
    historyHtml = `
      <h3>Case History</h3>
      <ul class="timeline">
        ${caseData.history.map(event => `
          <li class="timeline-item">
            <p class="timeline-date">${event.date}</p>
            <p class="timeline-content">${event.action}</p>
            <p class="timeline-by">By: ${event.by}</p>
          </li>
        `).join('')}
      </ul>
    `;
  }
  
  // Get current user
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Determine if the user can upload documents
  let uploadFormHtml = '';
  if (user) {
    const canUpload = 
      (user.role === 'client' && user.name === caseData.submittedBy) ||
      (user.role === 'lawyer' && user.name === caseData.assignedTo) ||
      (user.role === 'judge' && user.name === caseData.judge);
    
    if (canUpload) {
      uploadFormHtml = `
        <div class="document-upload-form">
          <h3>Upload Document</h3>
          <form id="upload-document-form">
            <input type="hidden" id="case-id" value="${caseData.id}">
            <div class="form-group">
              <label for="document-file">Select Document</label>
              <input type="file" id="document-file" accept=".pdf,.doc,.docx,.txt">
            </div>
            <div class="form-group">
              <button type="submit" class="btn" id="upload-document-btn">Upload Document</button>
            </div>
            <p id="upload-status"></p>
          </form>
        </div>
      `;
    }
  }
  
  detailsContent.innerHTML = `
    <h2>${caseData.title}</h2>
    <div class="case-info">
      <p><strong>Case ID:</strong> <span id="case-id-display">${caseData.id}</span></p>
      <p><strong>Status:</strong> <span class="status status-${caseData.status.toLowerCase().replace(' ', '-')}">${caseData.status}</span></p>
      <p><strong>Filed By:</strong> <span data-submitted-by="${caseData.submittedBy}">${caseData.submittedBy}</span></p>
      <p><strong>Filed Date:</strong> ${caseData.filingDate}</p>
      <p><strong>Assigned To:</strong> <span data-assigned-to="${caseData.assignedTo}">${caseData.assignedTo}</span></p>
      <p><strong>Judge:</strong> <span data-judge="${caseData.judge}">${caseData.judge}</span></p>
      <p><strong>Next Hearing:</strong> ${caseData.nextHearing || 'Not scheduled'}</p>
      <p><strong>Court Room:</strong> ${caseData.courtRoom || 'Not assigned'}</p>
      <p><strong>Case Type:</strong> ${caseData.caseType}</p>
    </div>
    
    <div class="case-description">
      <h3>Description</h3>
      <p>${caseData.description}</p>
    </div>
    
    ${documentsHtml}
    ${uploadFormHtml}
    ${historyHtml}
  `;
}

// Function to load all lawyers
async function loadAllLawyers() {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const users = await response.json();
    const lawyers = users.filter(user => user.role === 'lawyer');
    
    const lawyersGrid = document.getElementById('lawyers-grid');
    if (!lawyersGrid) return;
    
    lawyersGrid.innerHTML = '';
    
    lawyers.forEach(lawyer => {
      const card = document.createElement('div');
      card.className = 'card';
      
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.style.margin = '0 auto 1rem';
      avatar.textContent = getInitials(lawyer.name);
      
      const name = document.createElement('h3');
      name.textContent = lawyer.name;
      name.style.textAlign = 'center';
      
      const email = document.createElement('p');
      email.innerHTML = `<strong>Email:</strong> ${lawyer.email}`;
      
      const id = document.createElement('p');
      id.innerHTML = `<strong>Bar ID:</strong> ${lawyer.id}`;
      
      const experience = document.createElement('p');
      experience.innerHTML = `<strong>Experience:</strong> ${lawyer.experience || 'Not specified'}`;
      
      const specialization = document.createElement('p');
      specialization.innerHTML = `<strong>Specialization:</strong> ${lawyer.specialization || 'General'}`;
      
      card.appendChild(avatar);
      card.appendChild(name);
      card.appendChild(email);
      card.appendChild(id);
      card.appendChild(experience);
      card.appendChild(specialization);
      
      lawyersGrid.appendChild(card);
    });
    
    // Add search functionality
    const lawyerSearch = document.getElementById('lawyer-search');
    if (lawyerSearch) {
      lawyerSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const cards = lawyersGrid.getElementsByClassName('card');
        
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const text = card.textContent.toLowerCase();
          
          if (text.includes(searchTerm)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        }
      });
    }
    
    return lawyers;
  } catch (error) {
    console.error('Error loading lawyers:', error);
    return [];
  }
}

// Helper function to get initials from name
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // View all cases button
  const viewCasesBtn = document.getElementById('view-cases-btn');
  if (viewCasesBtn) {
    viewCasesBtn.addEventListener('click', async function() {
      await displayAllCases();
      
      // Hide all sections
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show all cases section
      const allCasesSection = document.getElementById('all-cases-section');
      if (allCasesSection) {
        allCasesSection.style.display = 'block';
      }
    });
  }
  
  // View all lawyers button
  const viewLawyersBtn = document.getElementById('view-lawyers-btn');
  if (viewLawyersBtn) {
    viewLawyersBtn.addEventListener('click', async function() {
      await loadAllLawyers();
      
      // Hide all sections
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show lawyers section
      const lawyersSection = document.getElementById('lawyers-section');
      if (lawyersSection) {
        lawyersSection.style.display = 'block';
      }
    });
  }
  
  // Back buttons
  const backToHomeBtn = document.getElementById('back-to-home');
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', function() {
      // Hide all sections
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show home section
      const homeSection = document.getElementById('home-section');
      if (homeSection) {
        homeSection.style.display = 'block';
      }
    });
  }
  
  const backToCasesBtn = document.getElementById('back-to-cases');
  if (backToCasesBtn) {
    backToCasesBtn.addEventListener('click', function() {
      // Hide all sections
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show all cases section
      const allCasesSection = document.getElementById('all-cases-section');
      if (allCasesSection) {
        allCasesSection.style.display = 'block';
      }
    });
  }
  
  const backToHomeFromLawyersBtn = document.getElementById('back-to-home-from-lawyers');
  if (backToHomeFromLawyersBtn) {
    backToHomeFromLawyersBtn.addEventListener('click', function() {
      // Hide all sections
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        section.style.display = 'none';
      });
      
      // Show home section
      const homeSection = document.getElementById('home-section');
      if (homeSection) {
        homeSection.style.display = 'block';
      }
    });
  }
});