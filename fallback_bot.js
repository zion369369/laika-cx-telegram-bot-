require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Constants
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7577088151:AAHCGlXcowq0c4CoAZ3_AM-cV9f-qfl7-BU';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-8e3db7a1fabe4f4a8bb44348d2761343';
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

// Fallback response generator that works without API
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
      try {
      // First attempt - standard DeepSeek API endpoint
      console.log('Using DeepSeek API key (first few chars):', DEEPSEEK_API_KEY.substring(0, 5));
      console.log('Attempting connection to primary DeepSeek API endpoint...');
      
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
        timeout: 20000 // Extended timeout to 20 seconds
      });
      
      console.log('Success! Response received from DeepSeek API');
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        console.log('Valid response structure received');
        return response.data.choices[0].message.content;
      } else {
        console.error('Unexpected API response structure:', JSON.stringify(response.data));
        throw new Error('Invalid response structure from API');
      }
    } catch (error) {
      console.error('First API attempt failed with error:', error.message);
      if (error.response) {
        console.error('API responded with status:', error.response.status);
        console.error('API response data:', JSON.stringify(error.response.data));
      }      try {
        // Second attempt - alternative API endpoint
        const apiKey = DEEPSEEK_API_KEY.startsWith('sk-') ? DEEPSEEK_API_KEY : `sk-${DEEPSEEK_API_KEY}`;
        console.log('Trying alternative endpoint: api.deepseek.ai with API key format check');
        
        const response = await axios.post('https://api.deepseek.ai/v1/chat/completions', {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 20000 // Extended timeout to 20 seconds
        });
        
        console.log('Success! Response received from alternative DeepSeek API');
        return response.data.choices[0].message.content;
      } catch (secondError) {
        console.error('Second API attempt failed with error:', secondError.message);
        
        // Third attempt - OpenAI-compatible endpoint
        try {
          console.log('Trying third alternative endpoint as OpenAI-compatible...');
          
          const response = await axios.post('https://api.deepinfra.com/v1/openai/chat/completions', {
            model: 'deepseek-ai/deepseek-chat-v1',
            messages: [
              { role: 'system', content: 'You are a helpful assistant for Laika CX.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            timeout: 20000
          });
          
          console.log('Success! Response received from third API attempt');
          return response.data.choices[0].message.content;
        } catch (thirdError) {
          console.error('All API attempts failed. Using fallback response generator.');
          console.error('Final error:', thirdError.message);
          return generateFallbackResponse(userMessage);
        }
      }
    }
  } catch (error) {
    console.error('Error in generateDeepSeekResponse:', error.message);
    return generateFallbackResponse(userMessage);
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
    
    // Generate response using DeepSeek or fallback
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
