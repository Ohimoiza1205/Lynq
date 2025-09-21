const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBackendNoAuth() {
  console.log('🚀 Testing Lynq Backend WITHOUT Authentication\n');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health Check
  totalTests++;
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Health Check: PASS');
      passedTests++;
    }
  } catch (error) {
    console.log('❌ Health Check: FAIL');
  }

  // Test 2: Video Creation (No Auth)
  totalTests++;
  try {
    const videoData = {
      title: 'Test Medical Video No Auth',
      description: 'Testing video creation without authentication',
      track: 'healthcare',
      source: 'upload'
    };
    
    const response = await axios.post(`${BASE_URL}/api/test/video`, videoData);
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Video Creation (No Auth): PASS');
      console.log(`   📹 Created video: ${response.data.title}`);
      passedTests++;
      global.testVideoId = response.data.id || response.data._id;
    }
  } catch (error) {
    console.log('❌ Video Creation (No Auth): FAIL -', error.response?.status);
  }

  // Test 3: Video Retrieval (No Auth)
  if (global.testVideoId) {
    totalTests++;
    try {
      const response = await axios.get(`${BASE_URL}/api/test/video/${global.testVideoId}`);
      if (response.status === 200) {
        console.log('✅ Video Retrieval (No Auth): PASS');
        passedTests++;
      }
    } catch (error) {
      console.log('❌ Video Retrieval (No Auth): FAIL');
    }
  }

  // Test 4: Search (No Auth)
  totalTests++;
  try {
    const response = await axios.get(`${BASE_URL}/api/test/search/videos?query=medical`);
    if (response.status === 200) {
      console.log('✅ Search (No Auth): PASS');
      passedTests++;
    }
  } catch (error) {
    console.log('❌ Search (No Auth): FAIL');
  }

  // Test 5: YouTube Import (No Auth)
  totalTests++;
  try {
    const response = await axios.post(`${BASE_URL}/api/test/import/youtube`, {
      url: 'https://www.youtube.com/watch?v=test',
      track: 'healthcare'
    });
    if (response.status === 200) {
      console.log('✅ YouTube Import (No Auth): PASS');
      passedTests++;
    }
  } catch (error) {
    console.log('❌ YouTube Import (No Auth): FAIL');
  }

  console.log('\n📊 No-Auth Test Results:');
  console.log(`${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL CORE FUNCTIONALITY WORKS! Authentication is the only issue.');
  }
}

testBackendNoAuth().catch(console.error);