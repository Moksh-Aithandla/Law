const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Create necessary directories
const frontendDir = path.join(__dirname, 'frontend');
const dataDir = path.join(frontendDir, 'data');
const jsDir = path.join(frontendDir, 'js');
const cssDir = path.join(frontendDir, 'css');

// Ensure directories exist
[frontendDir, dataDir, jsDir, cssDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve static files
app.use(express.static(frontendDir));
app.use(express.json());

// Create sample users data if it doesn't exist
const usersPath = path.join(frontendDir, 'users.json');
if (!fs.existsSync(usersPath)) {
  const users = generateUsers();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  console.log(`Created sample users data at ${usersPath}`);
}

// Create sample cases data if it doesn't exist
const casesPath = path.join(dataDir, 'cases.json');
if (!fs.existsSync(casesPath)) {
  const cases = generateCases();
  fs.writeFileSync(casesPath, JSON.stringify(cases, null, 2));
  console.log(`Created sample cases data at ${casesPath}`);
}

// API endpoints
app.get('/api/users', (req, res) => {
  if (fs.existsSync(usersPath)) {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    res.json(users);
  } else {
    res.status(404).json({ error: 'Users data not found' });
  }
});

app.get('/api/cases', (req, res) => {
  if (fs.existsSync(casesPath)) {
    const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
    res.json(cases);
  } else {
    res.status(404).json({ error: 'Cases data not found' });
  }
});

// Generate sample users
function generateUsers() {
  const users = [];
  
  // Add judges
  const judges = [
    { name: 'Judge Smith', id: 'JID001', email: 'judge.smith@judiciary.gov', experience: '15 years', specialization: 'Corporate Law' },
    { name: 'Judge Patel', id: 'JID002', email: 'judge.patel@judiciary.gov', experience: '12 years', specialization: 'Criminal Law' }
  ];
  
  for (let i = 0; i < judges.length; i++) {
    users.push({
      name: judges[i].name,
      id: judges[i].id,
      email: judges[i].email,
      role: 'judge',
      experience: judges[i].experience,
      specialization: judges[i].specialization,
      address: `0x${(i + 1).toString().padStart(40, '0')}`
    });
  }
  
  // Generate more judges
  for (let i = 3; i <= 25; i++) {
    const id = `JID${i.toString().padStart(3, '0')}`;
    const name = `Judge ${getRandomName()}`;
    users.push({
      name,
      id,
      email: `judge.${name.toLowerCase().replace(' ', '.')}@judiciary.gov`,
      role: 'judge',
      experience: `${Math.floor(Math.random() * 20) + 5} years`,
      specialization: getRandomSpecialization(),
      address: `0x${i.toString().padStart(40, '0')}`
    });
  }
  
  // Add lawyers
  const lawyers = [
    { name: 'John Doe', id: 'BAR001', email: 'john.doe@lawfirm.com', experience: '10 years', specialization: 'Corporate Law' },
    { name: 'Jane Smith', id: 'BAR002', email: 'jane.smith@lawfirm.com', experience: '8 years', specialization: 'Family Law' },
    { name: 'Robert Johnson', id: 'BAR003', email: 'robert.johnson@lawfirm.com', experience: '12 years', specialization: 'Property Law' }
  ];
  
  for (let i = 0; i < lawyers.length; i++) {
    users.push({
      name: lawyers[i].name,
      id: lawyers[i].id,
      email: lawyers[i].email,
      role: 'lawyer',
      experience: lawyers[i].experience,
      specialization: lawyers[i].specialization,
      address: `0x${(i + 26).toString().padStart(40, '0')}`
    });
  }
  
  // Generate more lawyers
  for (let i = 4; i <= 50; i++) {
    const id = `BAR${i.toString().padStart(3, '0')}`;
    const name = getRandomName();
    users.push({
      name,
      id,
      email: `${name.toLowerCase().replace(' ', '.')}@lawfirm.com`,
      role: 'lawyer',
      experience: `${Math.floor(Math.random() * 15) + 2} years`,
      specialization: getRandomSpecialization(),
      address: `0x${(i + 25).toString().padStart(40, '0')}`
    });
  }
  
  // Add clients
  const clients = [
    { name: 'Alice Brown', email: 'alice.brown@example.com', company: 'ABC Corporation' },
    { name: 'Bob Wilson', email: 'bob.wilson@example.com', company: 'XYZ Enterprises' }
  ];
  
  for (let i = 0; i < clients.length; i++) {
    users.push({
      name: clients[i].name,
      email: clients[i].email,
      role: 'client',
      company: clients[i].company,
      address: `0x${(i + 76).toString().padStart(40, '0')}`
    });
  }
  
  // Generate more clients
  for (let i = 3; i <= 30; i++) {
    const name = getRandomName();
    users.push({
      name,
      email: `client${i}@example.com`,
      role: 'client',
      company: `Company ${i}`,
      address: `0x${(i + 75).toString().padStart(40, '0')}`
    });
  }
  
  return users;
}

// Generate sample cases
function generateCases() {
  const cases = [];
  const statuses = ['Registered', 'In Progress', 'Scheduled', 'Postponed', 'Closed'];
  const caseTypes = [
    'Civil - Property Dispute',
    'Civil - Contract Breach',
    'Civil - Intellectual Property',
    'Civil - Personal Injury',
    'Criminal - Fraud',
    'Criminal - Theft',
    'Family - Divorce',
    'Family - Child Custody',
    'Corporate - Merger',
    'Corporate - Acquisition'
  ];
  
  // Add a few specific cases
  cases.push({
    id: 1,
    title: 'ABC Corp vs. Property Developer',
    description: 'Property dispute case involving commercial real estate in downtown business district. The client claims breach of purchase agreement and seeks damages.',
    submittedBy: 'Alice Brown',
    assignedTo: 'John Doe',
    judge: 'Judge Smith',
    status: 'In Progress',
    filingDate: '2023-10-15',
    nextHearing: '2023-12-10',
    caseType: 'Civil - Property Dispute',
    courtRoom: 'Room 302, District Court',
    documents: [
      {name: 'Property_Deed.pdf', url: '/documents/property_deed.pdf', uploadedBy: 'John Doe', uploadDate: '2023-10-16'},
      {name: 'Contract_Agreement.pdf', url: '/documents/contract_agreement.pdf', uploadedBy: 'Alice Brown', uploadDate: '2023-10-15'},
      {name: 'Evidence_Photos.pdf', url: '/documents/evidence_photos.pdf', uploadedBy: 'John Doe', uploadDate: '2023-10-20'}
    ],
    history: [
      {date: '2023-10-15', action: 'Case Filed', by: 'Alice Brown'},
      {date: '2023-10-16', action: 'Case Assigned to Judge', by: 'System'},
      {date: '2023-10-20', action: 'Status Changed to In Progress', by: 'Judge Smith'},
      {date: '2023-10-25', action: 'Hearing Scheduled', by: 'Court Clerk'}
    ]
  });
  
  cases.push({
    id: 2,
    title: 'XYZ Enterprises vs. Software Inc.',
    description: 'Contract breach case regarding software development project. The client claims the delivered software does not meet the agreed specifications.',
    submittedBy: 'Bob Wilson',
    assignedTo: 'Jane Smith',
    judge: 'Judge Patel',
    status: 'Scheduled',
    filingDate: '2023-10-20',
    nextHearing: '2023-12-15',
    caseType: 'Civil - Contract Breach',
    courtRoom: 'Room 405, District Court',
    documents: [
      {name: 'Contract.pdf', url: '/documents/contract.pdf', uploadedBy: 'Bob Wilson', uploadDate: '2023-10-20'},
      {name: 'Project_Specifications.pdf', url: '/documents/project_specifications.pdf', uploadedBy: 'Jane Smith', uploadDate: '2023-10-22'},
      {name: 'Email_Communications.pdf', url: '/documents/email_communications.pdf', uploadedBy: 'Jane Smith', uploadDate: '2023-10-25'}
    ],
    history: [
      {date: '2023-10-20', action: 'Case Filed', by: 'Bob Wilson'},
      {date: '2023-10-21', action: 'Case Assigned to Judge', by: 'System'},
      {date: '2023-10-23', action: 'Status Changed to Scheduled', by: 'Judge Patel'},
      {date: '2023-10-26', action: 'Hearing Scheduled', by: 'Court Clerk'}
    ]
  });
  
  cases.push({
    id: 3,
    title: 'ABC Corp vs. Supplier Co.',
    description: 'Contract dispute regarding supply of materials. The client claims the supplied materials were defective and caused production delays.',
    submittedBy: 'Alice Brown',
    assignedTo: 'Robert Johnson',
    judge: 'Judge Smith',
    status: 'Registered',
    filingDate: '2023-10-25',
    nextHearing: '2023-12-20',
    caseType: 'Civil - Contract Breach',
    courtRoom: 'Room 302, District Court',
    documents: [
      {name: 'Supply_Contract.pdf', url: '/documents/supply_contract.pdf', uploadedBy: 'Alice Brown', uploadDate: '2023-10-25'},
      {name: 'Quality_Report.pdf', url: '/documents/quality_report.pdf', uploadedBy: 'Robert Johnson', uploadDate: '2023-10-27'}
    ],
    history: [
      {date: '2023-10-25', action: 'Case Filed', by: 'Alice Brown'},
      {date: '2023-10-26', action: 'Case Assigned to Judge', by: 'System'},
      {date: '2023-10-28', action: 'Status Changed to Registered', by: 'Judge Smith'}
    ]
  });
  
  // Generate more cases
  for (let i = 4; i <= 100; i++) {
    const clientIndex = Math.floor(Math.random() * 30);
    const lawyerIndex = Math.floor(Math.random() * 50);
    const judgeIndex = Math.floor(Math.random() * 25);
    
    const client = `Client ${clientIndex + 1}`;
    const lawyer = `Lawyer ${lawyerIndex + 1}`;
    const judge = `Judge ${judgeIndex + 1}`;
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const caseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    
    const filingDate = getRandomDate(new Date(2023, 0, 1), new Date());
    let nextHearing = null;
    
    if (status !== 'Closed') {
      nextHearing = getRandomDate(new Date(), new Date(2023, 11, 31));
    }
    
    cases.push({
      id: i,
      title: `Case ${i}: ${client} vs. Defendant ${i}`,
      description: `This is a sample case description for case ${i}.`,
      submittedBy: client,
      assignedTo: lawyer,
      judge: judge,
      status: status,
      filingDate: filingDate,
      nextHearing: nextHearing,
      caseType: caseType,
      courtRoom: `Room ${Math.floor(Math.random() * 5) + 1}01, District Court`,
      documents: [
        {name: `Document1_Case${i}.pdf`, url: `/documents/document1_case${i}.pdf`, uploadedBy: client, uploadDate: filingDate},
        {name: `Document2_Case${i}.pdf`, url: `/documents/document2_case${i}.pdf`, uploadedBy: lawyer, uploadDate: getRandomDate(new Date(filingDate), new Date())}
      ],
      history: [
        {date: filingDate, action: 'Case Filed', by: client},
        {date: getRandomDate(new Date(filingDate), new Date()), action: 'Case Assigned to Judge', by: 'System'},
        {date: getRandomDate(new Date(filingDate), new Date()), action: `Status Changed to ${status}`, by: judge}
      ]
    });
  }
  
  return cases;
}

// Helper function to get a random name
function getRandomName() {
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

// Helper function to get a random specialization
function getRandomSpecialization() {
  const specializations = ['Corporate Law', 'Criminal Law', 'Family Law', 'Property Law', 'Intellectual Property', 'Tax Law', 'Environmental Law', 'Labor Law', 'Immigration Law', 'Constitutional Law'];
  
  return specializations[Math.floor(Math.random() * specializations.length)];
}

// Helper function to get a random date
function getRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});