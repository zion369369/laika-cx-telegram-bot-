require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Constants
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7577088151:AAHCGlXcowq0c4CoAZ3_AM-cV9f-qfl7-BU';
const DEEPSEEK_API_KEY = 'sk-8e3db7a1fabe4f4a8bb44348d2761343'; // TODO: Move this to .env file
let lastUpdateId = 0;

// Keep service alive by preventing it from sleeping
const keepAlive = () => {
  // Check if running on Replit
  if (process.env.REPLIT_DB_URL) {
    console.log('Running on Replit - implementing keep-alive ping');
    setInterval(() => {
      console.log('Ping to keep Replit alive: ' + new Date().toISOString());
    }, 5 * 60 * 1000); // Ping every 5 minutes
  }
  // For Render.com, no keep-alive needed for web services
  else if (process.env.RENDER) {
    console.log('Running on Render - no keep-alive needed');
  }
  else {
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

// Generate response with DeepSeek API
const generateDeepSeekResponse = async (userMessage) => {
  try {
    const faqs = loadFAQs();
    
    // Construct prompt with FAQs
    let prompt = 'You are a helpful customer support agent for Laika CX. Use the following FAQs to help answer the user:\n\n';
    
    faqs.faqs.forEach(faq => {
      prompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
    });
    
    prompt += `User: ${userMessage}\nSupport Agent:`;
    
    console.log('Sending request to DeepSeek API...');
    console.log('Using DeepSeek API key:', DEEPSEEK_API_KEY.substring(0, 5) + '...');
    
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
      }
    });
    
    console.log('Response received from DeepSeek API');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response with DeepSeek API:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', JSON.stringify(error.response.data));
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    // Provide a more helpful response to users
    return 'I apologize, but I am experiencing some technical difficulties connecting to my knowledge base. Please try again later or contact our support team directly at support@laikacx.com.';
  }
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
    
    console.log(`Message sent to ${chatId}: ${message}`);
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
};

// Process updates from Telegram
const processUpdate = async (update) => {
  if (update && update.message) {
    const chatId = update.message.chat.id;
    const messageText = update.message.text;
    const userName = update.message.from.first_name || 'User';
    
    console.log(`Message from ${userName} (${chatId}): ${messageText}`);
    
    // Generate response using DeepSeek
    const response = await generateDeepSeekResponse(messageText);
    
    // Send response back to user
    await sendTelegramMessage(chatId, response);
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
    console.error('Error getting updates:', error);
  }
  
  // Poll again after a short delay
  setTimeout(getUpdates, 1000);
};

// Start polling for updates
console.log('Starting Laika CX Telegram Bot in polling mode...');
console.log('Bot is now running. Press Ctrl+C to stop.');

// Start keep-alive for Replit
keepAlive();

// Start polling
getUpdates();
