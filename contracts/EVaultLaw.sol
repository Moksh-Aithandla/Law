// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EVaultLaw {
    // Structs
    struct Case {
        string title;
        string description;
        string caseType;
        string submittedBy;
        string assignedTo;
        string judge;
        string status;
        uint256 filingDate;
    }
    
    struct Document {
        string name;
        string documentContent; // Store document content directly on blockchain
        string documentType;    // File type (e.g., pdf, docx)
        string uploadedBy;
        uint256 uploadDate;
    }
    
    // State variables
    mapping(uint256 => Case) public cases;
    mapping(uint256 => Document[]) public caseDocuments;
    mapping(address => string) public userWallets; // Map wallet addresses to user emails
    uint256 public caseCount;
    address public owner;
    
    // Events
    event CaseRegistered(uint256 indexed caseId, string title, string submittedBy, address indexed submitterWallet);
    event DocumentAdded(uint256 indexed caseId, string documentName, address indexed uploaderWallet);
    event CaseStatusChanged(uint256 indexed caseId, string oldStatus, string newStatus);
    event UserRegistered(string email, address indexed userWallet);
    
    // Constructor
    constructor() {
        owner = msg.sender;
        caseCount = 0;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Functions
    function registerUser(string memory _email) public {
        require(bytes(userWallets[msg.sender]).length == 0, "Wallet already registered");
        userWallets[msg.sender] = _email;
        emit UserRegistered(_email, msg.sender);
    }
    
    function registerCase(
        string memory _title,
        string memory _description,
        string memory _caseType,
        string memory _submittedBy,
        string memory _assignedTo,
        string memory _judge
    ) public returns (uint256) {
        caseCount++;
        
        cases[caseCount] = Case({
            title: _title,
            description: _description,
            caseType: _caseType,
            submittedBy: _submittedBy,
            assignedTo: _assignedTo,
            judge: _judge,
            status: "Registered",
            filingDate: block.timestamp
        });
        
        emit CaseRegistered(caseCount, _title, _submittedBy, msg.sender);
        
        return caseCount;
    }
    
    function addDocument(
        uint256 _caseId,
        string memory _documentName,
        string memory _documentContent,
        string memory _documentType,
        string memory _uploadedBy
    ) public {
        require(_caseId > 0 && _caseId <= caseCount, "Invalid case ID");
        
        Document memory newDocument = Document({
            name: _documentName,
            documentContent: _documentContent,
            documentType: _documentType,
            uploadedBy: _uploadedBy,
            uploadDate: block.timestamp
        });
        
        caseDocuments[_caseId].push(newDocument);
        
        emit DocumentAdded(_caseId, _documentName, msg.sender);
    }
    
    function updateCaseStatus(uint256 _caseId, string memory _newStatus) public {
        require(_caseId > 0 && _caseId <= caseCount, "Invalid case ID");
        
        string memory oldStatus = cases[_caseId].status;
        cases[_caseId].status = _newStatus;
        
        emit CaseStatusChanged(_caseId, oldStatus, _newStatus);
    }
    
    function getCaseDetails(uint256 _caseId) public view returns (Case memory) {
        require(_caseId > 0 && _caseId <= caseCount, "Invalid case ID");
        return cases[_caseId];
    }
    
    function getDocuments(uint256 _caseId) public view returns (Document[] memory) {
        require(_caseId > 0 && _caseId <= caseCount, "Invalid case ID");
        return caseDocuments[_caseId];
    }
    
    function getDocumentContent(uint256 _caseId, uint256 _documentIndex) public view returns (string memory) {
        require(_caseId > 0 && _caseId <= caseCount, "Invalid case ID");
        require(_documentIndex < caseDocuments[_caseId].length, "Invalid document index");
        return caseDocuments[_caseId][_documentIndex].documentContent;
    }
    
    function getCaseCount() public view returns (uint256) {
        return caseCount;
    }
    
    function getUserEmail(address _wallet) public view returns (string memory) {
        return userWallets[_wallet];
    }
}