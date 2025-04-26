// Ensure web3.js (or ethers.js) is loaded in your HTML file for contract interaction
let provider;
let signer;
let ipfsManagerContract;

// Connect to MetaMask (or any other wallet)
async function initEthereum() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request account access
        signer = provider.getSigner(); // Get the signer (user's wallet)
        console.log("Ethereum connected");

        // Replace with your contract's ABI and deployed address
        const ipfsManagerAddress = "YOUR_CONTRACT_ADDRESS"; // Contract address here
        const ipfsManagerABI = [
            "function storeDocument(string memory ipfsHash) public"
        ];

        // Create contract instance
        ipfsManagerContract = new ethers.Contract(ipfsManagerAddress, ipfsManagerABI, signer);
    } else {
        alert("Please install MetaMask to use this feature.");
    }
}

// Handle the file upload
async function handleFileUpload(event) {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0]; // Get the selected file

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    // Validate file type (including JPG, PNG, PDF)
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a JPEG, PNG, or PDF.");
        return;
    }

    // Validate file size (max 10MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 10) {
        alert("File is too large. Please upload a file smaller than 10MB.");
        return;
    }

    // Display status message
    const statusMessage = document.getElementById("status-message");
    statusMessage.textContent = "Uploading...";

    try {
        // Connect to IPFS and upload the file
        const ipfs = await Ipfs.create();
        console.log("IPFS Client Created");

        const addedFile = await ipfs.add(file);  // Upload to IPFS
        console.log("File uploaded to IPFS:", addedFile.path);  // Debug log for IPFS upload path

        statusMessage.textContent = `File uploaded successfully! IPFS path: ${addedFile.path}`;

        // Store the IPFS hash in the smart contract
        await storeDocumentInContract(addedFile.path);
    } catch (error) {
        console.error("Error uploading file:", error);
        statusMessage.textContent = "Error uploading file. Please try again.";
    }
}

// Store the document IPFS hash in the contract
async function storeDocumentInContract(ipfsHash) {
    try {
        console.log("Storing IPFS hash in contract:", ipfsHash);
        const tx = await ipfsManagerContract.storeDocument(ipfsHash);
        await tx.wait();  // Wait for the transaction to be mined
        console.log("Document hash stored in contract:", ipfsHash);
        alert("Document successfully stored in the contract!");
    } catch (error) {
        console.error("Error storing document in contract:", error);
        alert("Error storing document in contract.");
    }
}

// Add event listener for form submission
document.getElementById("upload-form").addEventListener("submit", handleFileUpload);

// Initialize Ethereum connection when the page loads
window.onload = async () => {
    await initEthereum();  // Initialize Ethereum connection
};
