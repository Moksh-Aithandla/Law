const http = require('http');
const fs = require('fs');
const path = require('path');

// Test if the server is running
function testServer() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:3000', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Server is running. Status code:', res.statusCode);
        resolve(true);
      });
    }).on('error', (err) => {
      console.error('Server test failed:', err.message);
      resolve(false);
    });
  });
}

// Test if the API endpoints are working
function testAPI() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:3000/api/users', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const users = JSON.parse(data);
          console.log('API is working. Found', users.length, 'users');
          resolve(true);
        } catch (e) {
          console.error('API test failed: Could not parse JSON');
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error('API test failed:', err.message);
      resolve(false);
    });
  });
}

// Test if the files are in place
function testFiles() {
  const files = [
    path.join(__dirname, 'frontend', 'index.html'),
    path.join(__dirname, 'frontend', 'users.json'),
    path.join(__dirname, 'frontend', 'data', 'cases.json')
  ];
  
  let allFilesExist = true;
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log('File exists:', file);
    } else {
      console.error('File missing:', file);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Run all tests
async function runTests() {
  console.log('Testing E-Vault Law Management System...');
  console.log('----------------------------------------');
  
  console.log('\nTesting files:');
  const filesOK = testFiles();
  
  console.log('\nTesting server:');
  const serverOK = await testServer();
  
  console.log('\nTesting API:');
  const apiOK = await testAPI();
  
  console.log('\nTest results:');
  console.log('----------------------------------------');
  console.log('Files:', filesOK ? 'OK' : 'FAILED');
  console.log('Server:', serverOK ? 'OK' : 'FAILED');
  console.log('API:', apiOK ? 'OK' : 'FAILED');
  console.log('----------------------------------------');
  
  if (filesOK && serverOK && apiOK) {
    console.log('All tests passed! The application is working correctly.');
  } else {
    console.log('Some tests failed. Please check the issues above.');
  }
}

// Run the tests
runTests();