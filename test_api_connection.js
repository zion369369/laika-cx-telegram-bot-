// Enhanced API Connection Test Script
// Usage: node test_api_connection.js
require('dotenv').config();
const axios = require('axios');

// Get API keys from environment or use defaults
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-8e3db7a1fabe4f4a8bb44348d2761343';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Test message - simple to verify
const testMessage = "Hello, this is a test message to verify API connectivity. Please respond with a brief greeting.";

// Attempt with first endpoint
async function testPrimaryEndpoint() {
  console.log('\n-------------------------------------');
  console.log('Testing primary DeepSeek endpoint:');
  console.log('https://api.deepseek.com/v1/chat/completions');
  console.log('-------------------------------------');
  
  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: testMessage }
      ],
      temperature: 0.7,
      max_tokens: 100
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ SUCCESS: Primary endpoint responded successfully');
    console.log('Response:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.log('❌ FAILED: Primary endpoint error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Attempt with second endpoint
async function testSecondaryEndpoint() {
  console.log('\n-------------------------------------');
  console.log('Testing alternative DeepSeek endpoint:');
  console.log('https://api.deepseek.ai/v1/chat/completions');
  console.log('-------------------------------------');
  
  // Ensure key has sk- prefix
  const apiKey = DEEPSEEK_API_KEY.startsWith('sk-') ? DEEPSEEK_API_KEY : `sk-${DEEPSEEK_API_KEY}`;
  
  try {
    const response = await axios.post('https://api.deepseek.ai/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: testMessage }
      ],
      temperature: 0.7,
      max_tokens: 100
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ SUCCESS: Alternative endpoint responded successfully');
    console.log('Response:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.log('❌ FAILED: Alternative endpoint error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Attempt with third endpoint (OpenAI compatible)
async function testOpenAICompatibleEndpoint() {
  console.log('\n-------------------------------------');
  console.log('Testing DeepInfra OpenAI-compatible endpoint:');
  console.log('https://api.deepinfra.com/v1/openai/chat/completions');
  console.log('-------------------------------------');
  
  try {
    const response = await axios.post('https://api.deepinfra.com/v1/openai/chat/completions', {
      model: 'deepseek-ai/deepseek-chat-v1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: testMessage }
      ],
      temperature: 0.7,
      max_tokens: 100
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ SUCCESS: OpenAI-compatible endpoint responded successfully');
    console.log('Response:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.log('❌ FAILED: OpenAI-compatible endpoint error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Test Hugging Face API
async function testHuggingFaceAPI() {
  if (!HUGGINGFACE_API_KEY) {
    console.log('\n-------------------------------------');
    console.log('Hugging Face API Test: SKIPPED');
    console.log('No API key provided. Set HUGGINGFACE_API_KEY in .env file to test.');
    console.log('-------------------------------------');
    return false;
  }

  console.log('\n-------------------------------------');
  console.log('Testing Hugging Face API endpoint:');
  console.log('https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf');
  console.log('-------------------------------------');
  
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      { inputs: testMessage },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
        },
        timeout: 30000 // 30 seconds for HF
      }
    );
    
    console.log('✅ SUCCESS: Hugging Face API responded successfully');
    console.log('Response:', response.data[0].generated_text.replace(testMessage, '').trim());
    return true;
  } catch (error) {
    console.log('❌ FAILED: Hugging Face API error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Test OpenAI API
async function testOpenAIAPI() {
  if (!OPENAI_API_KEY) {
    console.log('\n-------------------------------------');
    console.log('OpenAI API Test: SKIPPED');
    console.log('No API key provided. Set OPENAI_API_KEY in .env file to test.');
    console.log('-------------------------------------');
    return false;
  }

  console.log('\n-------------------------------------');
  console.log('Testing OpenAI API endpoint:');
  console.log('https://api.openai.com/v1/chat/completions');
  console.log('-------------------------------------');
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: testMessage }
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        timeout: 15000
      }
    );
    
    console.log('✅ SUCCESS: OpenAI API responded successfully');
    console.log('Response:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.log('❌ FAILED: OpenAI API error');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('===========================================');
  console.log('MULTI-API CONNECTION TESTS');
  console.log('===========================================');
  
  let results = {
    deepseek: {
      success: 0,
      total: 3,
      label: 'DeepSeek API'
    },
    huggingface: {
      success: 0,
      total: 1,
      label: 'Hugging Face API'
    },
    openai: {
      success: 0,
      total: 1,
      label: 'OpenAI API'
    }
  };
  
  console.log('Testing DeepSeek API endpoints...');
  console.log(`Using API key (first 10 chars): ${DEEPSEEK_API_KEY.substring(0, 10)}...`);
  
  // Test DeepSeek endpoints
  if (await testPrimaryEndpoint()) results.deepseek.success++;
  if (await testSecondaryEndpoint()) results.deepseek.success++;
  if (await testOpenAICompatibleEndpoint()) results.deepseek.success++;
  
  // Test Hugging Face API
  console.log('\nTesting Hugging Face API...');
  if (await testHuggingFaceAPI()) results.huggingface.success++;
  
  // Test OpenAI API
  console.log('\nTesting OpenAI API...');
  if (await testOpenAIAPI()) results.openai.success++;
  
  // Summary
  console.log('\n===========================================');
  console.log('TEST SUMMARY');
  console.log('===========================================');
  
  for (const [api, result] of Object.entries(results)) {
    console.log(`${result.label}: ${result.success}/${result.total} endpoints succeeded`);
  }
  
  const totalSuccess = results.deepseek.success + results.huggingface.success + results.openai.success;
  const totalTests = results.deepseek.total + results.huggingface.total + results.openai.total;
  
  if (totalSuccess > 0) {
    console.log('\n✅ GOOD NEWS: At least one API endpoint is working!');
    console.log(`Your bot should be able to use the working API(s) if configured correctly.`);
    
    if (results.deepseek.success === 0) {
      console.log('\n⚠️ Note: No DeepSeek endpoints succeeded. Consider using an alternative API.');
      if (results.huggingface.success > 0) {
        console.log('   ✓ Hugging Face API is working and can be used instead.');
      }
      if (results.openai.success > 0) {
        console.log('   ✓ OpenAI API is working and can be used instead.');
      }
    }
  } else {
    console.log('\n❌ ISSUE DETECTED: All API endpoints failed');
    console.log('This suggests issues with your API keys, network configuration,');
    console.log('or the API services themselves.');
    console.log('\nPlease check the following:');
    console.log('1. Your API keys are valid and active');
    console.log('2. Your network allows outbound connections to these APIs');
    console.log('3. The API services are online and working');
    console.log('4. Your accounts have sufficient credits or permissions');
  }
}

// Execute tests
runAllTests().catch(console.error);
