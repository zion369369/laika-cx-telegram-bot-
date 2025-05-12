// Multi-API Support Bot
// This version tries multiple LLM APIs to ensure maximum uptime
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Constants
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7577088151:AAHCGlXcowq0c4CoAZ3_AM-cV9f-qfl7-BU';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-8e3db7a1fabe4f4a8bb44348d2761343';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''; // Add your key to .env or Render
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''; // Add your key to .env or Render
let lastUpdateId = 0;
let apiFailureCount = {};

// Initialize failure counters
const resetApiFailureCounters = () => {
  apiFailureCount = {
    deepseek: 0,
    huggingface: 0,
    openai: 0
  };
};

resetApiFailureCounters();

// Keep service alive
const keepAlive = () => {
  if (process.env.REPLIT_DB_URL) {
    console.log('Running on Replit - implementing keep-alive ping');
    setInterval(() => {
      console.log('Ping to keep Replit alive: ' + new Date().toISOString());
    }, 5 * 60 * 1000);
  } else if (process.env.RENDER) {
    console.log('Running on Render - no keep-alive needed');
  } else {
    console.log('Running in other environment - no keep-alive implemented');
  }
};

// Load FAQs
const loadFAQs = () => {
  try {
    const faqsPath = path.join(__dirname, 'faqs.json');
    const faqsData = fs.readFileSync(faqsPath, 'utf8');
    return JSON.parse(faqsData);
  } catch (error) {
    console.error('Error loading FAQs:', error);
    return { faqs: [] };
  }
};

// Fallback response generator
const generateFallbackResponse = (userMessage) => {
  const faqs = loadFAQs();
  const userMessageLower = userMessage.toLowerCase();
  
  console.log('Generating fallback response using local FAQs - API connection failed');
  
  // First, check for exact keyword matches in questions
  for (const faq of faqs.faqs) {
    const questionLower = faq.question.toLowerCase();
    if (questionLower.includes(userMessageLower) || userMessageLower.includes(questionLower)) {
      return `I understand you're asking about ${faq.question}.\n\n${faq.answer}\n\nIs there anything specific about this that you'd like to know more about?`;
    }
  }
  
  // If no direct matches, look for partial keyword matches
  const keywords = userMessageLower.split(' ').filter(word => word.length > 3);
  
  for (const faq of faqs.faqs) {
    const questionLower = faq.question.toLowerCase();
    for (const keyword of keywords) {
      if (questionLower.includes(keyword)) {
        return `I think this information about ${faq.question} might help answer your question:\n\n${faq.answer}\n\nDoes this address what you were looking for?`;
      }
    }
  }
  
  // If still no match, return a more conversational response with all FAQ topics
  let response = "I'm not sure I fully understand your question. Here are the topics I can help you with:\n\n";
  faqs.faqs.forEach(faq => {
    response += `• ${faq.question}\n`;
  });
  response += "\nCould you please let me know which of these topics you're interested in, or try rephrasing your question?";
  
  return response;
};

// Primary API - DeepSeek
const generateDeepSeekResponse = async (prompt) => {
  console.log('Attempting to use DeepSeek API...');
  
  try {
    // First attempt - standard endpoint
    console.log('Trying primary DeepSeek API endpoint...');
    
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      timeout: 15000
    });
    
    console.log('DeepSeek API responded successfully!');
    apiFailureCount.deepseek = 0; // Reset failure counter on success
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API error:', error.message);
    apiFailureCount.deepseek++;
    throw error;
  }
};

// Secondary API - Hugging Face
const generateHuggingFaceResponse = async (prompt) => {
  if (!HUGGINGFACE_API_KEY) {
    console.log('No Hugging Face API key provided, skipping this option');
    throw new Error('Hugging Face API key not configured');
  }
  
  console.log('Attempting to use Hugging Face API...');
  
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
      { inputs: prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
        },
        timeout: 30000 // Longer timeout for HF
      }
    );
    
    console.log('Hugging Face API responded successfully!');
    apiFailureCount.huggingface = 0;
    return response.data[0].generated_text.replace(prompt, '').trim();
  } catch (error) {
    console.error('Hugging Face API error:', error.message);
    apiFailureCount.huggingface++;
    throw error;
  }
};

// Third API - OpenAI
const generateOpenAIResponse = async (prompt) => {
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key provided, skipping this option');
    throw new Error('OpenAI API key not configured');
  }
  
  console.log('Attempting to use OpenAI API...');
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant for Laika CX.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        timeout: 15000
      }
    );
    
    console.log('OpenAI API responded successfully!');
    apiFailureCount.openai = 0;
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    apiFailureCount.openai++;
    throw error;
  }
};

// Smart API router
const generateAIResponse = async (userMessage) => {
  const faqs = loadFAQs();
  
  // Construct prompt with FAQs
  let prompt = 'You are a helpful customer support agent for Laika CX. Use the following FAQs to help answer the user:\n\n';
  
  faqs.faqs.forEach(faq => {
    prompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
  });
  
  prompt += `User: ${userMessage}\nSupport Agent:`;
  
  console.log('Preparing to generate AI response using available APIs...');
  
  // Priority order based on failure counts
  const apiOptions = [
    { name: 'deepseek', fn: generateDeepSeekResponse, count: apiFailureCount.deepseek },
    { name: 'huggingface', fn: generateHuggingFaceResponse, count: apiFailureCount.huggingface },
    { name: 'openai', fn: generateOpenAIResponse, count: apiFailureCount.openai }
  ].sort((a, b) => a.count - b.count); // Sort by least failures first
  
  // Try APIs in order of reliability
  for (const api of apiOptions) {
    try {
      console.log(`Attempting to use ${api.name} API (failure count: ${api.count})...`);
      const response = await api.fn(prompt);
      return response;
    } catch (error) {
      console.error(`${api.name} API attempt failed, trying next option if available...`);
    }
  }
  
  // If all APIs fail, use the fallback
  console.warn('All API attempts failed. Using fallback response generator.');
  return generateFallbackResponse(userMessage);
};

// Send message back to Telegram
const sendTelegramMessage = async (chatId, message) => {
  try {
    console.log(`Sending message to chat ${chatId}`);
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    console.log(`Message sent successfully to ${chatId}`);
  } catch (error) {
    console.error(`Error sending message to Telegram: ${error.message}`);
  }
};

// Process updates from Telegram
const processUpdate = async (update) => {
  if (update && update.message) {
    const chatId = update.message.chat.id;
    const messageText = update.message.text;
    const userName = update.message.from.first_name || 'User';
    
    console.log(`Message from ${userName} (${chatId}): ${messageText}`);
    
    // Generate response
    try {
      const response = await generateAIResponse(messageText);
      await sendTelegramMessage(chatId, response);
    } catch (error) {
      console.error('Error processing message:', error);
      await sendTelegramMessage(chatId, 
        "I'm sorry, I'm experiencing technical difficulties at the moment. Please try again in a few moments.");
    }
  }
};

// Poll for updates
const getUpdates = async () => {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`, {
      params: {
        offset: lastUpdateId + 1,
        timeout: 30
      }
    });
    
    const updates = response.data.result;
    if (updates && updates.length > 0) {
      console.log(`Received ${updates.length} updates`);
      
      for (const update of updates) {
        await processUpdate(update);
        lastUpdateId = update.update_id;
      }
    }
  } catch (error) {
    console.error('Error getting updates:', error.message);
  }
  
  // Poll again after a short delay
  setTimeout(getUpdates, 1000);
};

// Start polling for updates
console.log('Starting Laika CX Telegram Bot with Multi-API support...');
console.log(`Using APIs: DeepSeek${HUGGINGFACE_API_KEY ? ', Hugging Face' : ''}${OPENAI_API_KEY ? ', OpenAI' : ''}`);
console.log('Bot is now running. Press Ctrl+C to stop.');

// Reset API failure counters every hour to allow retry of previously failed APIs
setInterval(resetApiFailureCounters, 60 * 60 * 1000);

// Start keep-alive for Replit
keepAlive();

// Start polling
getUpdates();
