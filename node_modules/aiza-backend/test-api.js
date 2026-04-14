const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/products');
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testAPI();