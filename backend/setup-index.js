// backend/setup-index.js
const axios = require('axios');
require('dotenv').config();

async function setupTwelveLabsIndex() {
  const apiKey = process.env.TWELVELABS_API_KEY;
  const baseUrl = 'https://api.twelvelabs.io/v1.3';
  
  if (!apiKey) {
    console.error('TWELVELABS_API_KEY not found in environment variables');
    return;
  }

  try {
    // Test connection
    console.log('Testing Twelve Labs connection...');
    const testResponse = await axios.get(`${baseUrl}/indexes`, {
      headers: { 'x-api-key': apiKey }
    });
    
    if (testResponse.status !== 200) {
      console.error('Connection test failed');
      return;
    }
    
    console.log('Connection successful');
    
    // Create index
    console.log('Creating medical video index...');
    const createResponse = await axios.post(`${baseUrl}/indexes`, {
      name: 'lynq-medical-videos',
      engines: [{
        name: 'marengo2.6',
        options: ['visual', 'conversation', 'text_in_video', 'logo']
      }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const index = createResponse.data;
    console.log('Index created successfully');
    console.log('Index ID:', index._id);
    console.log('Index Name:', index.name);
    console.log('');
    console.log('Add this to your .env file:');
    console.log(`TWELVELABS_INDEX_ID=${index._id}`);
    
  } catch (error) {
    console.error('Setup failed:', error.response?.data || error.message);
  }
}

setupTwelveLabsIndex();