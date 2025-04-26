// view.js

let provider;
let signer;
let ipfsManagerContract;

// Connect to Ethereum and initialize the contract
async function initEthereum() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);  // Request account access
        signer = provider.getSigner();  // Get the signer's address
        console.log("Ethereum connected");

        const ipfsManagerAddress = "YOUR_CONTRACT_ADDRESS";  // Replace with your contract address
        const ipfsManagerABI = [
            "function getDocuments() public view returns (string[] memory)"
        ];

        ipfsManagerContract = new ethers.Contract(ipfsManagerAddress, ipfsManagerABI, provider);
    } else {
        alert("Please install MetaMask to use this feature.");
    }
}

// Fetch and display uploaded documents from the contract
async function fetchDocuments() {
    try {
        const documents = await ipfsManagerContract.getDocuments();
        const documentsList = document.getElementById("documents-list");

        // Clear any previous list items
        documentsList.innerHTML = '';

        documents.forEach((ipfsHash) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<a href="https://ipfs.io/ipfs/${ipfsHash}" target="_blank">${ipfsHash}</a>`;
            documentsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
        alert("Error fetching documents. Please try again.");
    }
}

// Initialize Ethereum and fetch documents on page load
window.onload = async () => {
    await initEthereum();  // Connect to Ethereum
    await fetchDocuments();  // Fetch documents from contract
};
