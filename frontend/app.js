document.addEventListener('DOMContentLoaded', () => {
  // Initialize IPFS client (you'll use a service like Filebase or Infura to interact with IPFS)
  const { create } = require('ipfs-http-client'); // Import IPFS client
  const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' }); // Change to Filebase URL or Pinata URL if needed

  // Existing login and signup logic
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const loginFormSection = document.getElementById('loginFormSection');
  const signupFormSection = document.getElementById('signupFormSection');
  const roleSelectionSection = document.getElementById('roleSelectionSection');

  // Show login form when 'Login' is clicked
  loginBtn.addEventListener('click', () => {
      loginFormSection.style.display = 'block';
      signupFormSection.style.display = 'none';
      roleSelectionSection.style.display = 'none';
  });

  // Show signup form when 'Sign Up' is clicked
  signupBtn.addEventListener('click', () => {
      loginFormSection.style.display = 'none';
      signupFormSection.style.display = 'block';
      roleSelectionSection.style.display = 'none';
  });

  // Handle login logic
  document.getElementById('loginSubmitBtn').addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const id = document.getElementById('loginId').value.trim();

      const validLawyers = JSON.parse(localStorage.getItem('evault_lawyers')) || [];
      const validJudges = JSON.parse(localStorage.getItem('evault_judges')) || [];

      const validLawyer = validLawyers.find(lawyer => lawyer.email === email && lawyer.barId === id);
      const validJudge = validJudges.find(judge => judge.email === email && judge.judicialId === id);

      if (validLawyer || validJudge) {
          localStorage.setItem('evault_user', JSON.stringify(validLawyer || validJudge));
          showRoleSelection();
      } else {
          alert('Invalid login credentials.');
      }
  });

  // Handle sign-up logic
  document.getElementById('signupSubmitBtn').addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value.trim();
      const id = document.getElementById('signupId').value.trim();
      const password = document.getElementById('signupPassword').value.trim();

      const validLawyers = JSON.parse(localStorage.getItem('evault_lawyers')) || [];
      const validJudges = JSON.parse(localStorage.getItem('evault_judges')) || [];

      const isLawyer = validLawyers.some(lawyer => lawyer.barId === id);
      const isJudge = validJudges.some(judge => judge.judicialId === id);

      if (isLawyer || isJudge) {
          const user = {
              email,
              password,
              role: isLawyer ? 'lawyer' : 'judge',
              barId: isLawyer ? id : undefined,
              judicialId: isJudge ? id : undefined,
          };
          const existingUsers = JSON.parse(localStorage.getItem('evault_users')) || [];
          existingUsers.push(user);
          localStorage.setItem('evault_users', JSON.stringify(existingUsers));
          alert('Sign up successful!');
          showRoleSelection();
      } else {
          alert('Invalid Bar ID or Judicial ID');
      }
  });

  // Show role selection after login/signup
  function showRoleSelection() {
      roleSelectionSection.style.display = 'block';
      loginFormSection.style.display = 'none';
      signupFormSection.style.display = 'none';
  }

  // Handle role selection
  document.getElementById('loginAsLawyerBtn').addEventListener('click', () => {
      alert('Logging in as Lawyer...');
      window.location.href = '/frontend/lawyer-dashboard.html'; // Redirect to lawyer dashboard
  });

  document.getElementById('loginAsJudgeBtn').addEventListener('click', () => {
      alert('Logging in as Judge...');
      window.location.href = '/frontend/judge-dashboard.html'; // Redirect to judge dashboard
  });

  document.getElementById('loginAsClientBtn').addEventListener('click', () => {
      alert('Logging in as Client...');
      window.location.href = '/frontend/client-dashboard.html'; // Redirect to client dashboard
  });

  // User Registration Form (new part for handling IPFS upload)
  document.getElementById("register-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get values from the form
      const aadhar = document.getElementById("aadhar").value;
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;

      // Validate the input fields
      if (!aadhar || !name || !email) {
          alert("Please fill all fields");
          return;
      }

      // For now, mock registering the user (you will call the smart contract here later)
      try {
          console.log("User Registered:", { aadhar, name, email });
          alert("User Registered successfully!");

          // Optionally, you can upload data to IPFS here (as part of registration)

      } catch (err) {
          console.error("Error in registration:", err);
          alert("Error registering user!");
      }
  });

  // File upload form for IPFS
  document.getElementById("upload-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = document.getElementById("file-input").files[0];
      if (!file) {
          alert("Please select a file to upload!");
          return;
      }

      try {
          // Upload file to IPFS
          const added = await client.add(file);
          const fileUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
          console.log("File uploaded to IPFS:", fileUrl);
          alert("File uploaded successfully! URL: " + fileUrl);

          // Store this IPFS link in your smart contract (mocked for now)

      } catch (err) {
          console.error("Error uploading file to IPFS:", err);
          alert("Error uploading file to IPFS.");
      }
  });
});
