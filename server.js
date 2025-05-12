require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Constants
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = 'sk-8e3db7a1fabe4f4a8bb44348d2761343'; // TODO: Move this to .env file

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
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response with DeepSeek API:', error);
    return 'I apologize, but I am experiencing some technical difficulties at the moment. Please try again later or contact our support team directly.';
  }
};

// Send message back to Telegram
const sendTelegramMessage = async (chatId, message) => {
  try {
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

// Set up webhook for Telegram Bot
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    console.log('Telegram update received:', JSON.stringify(update, null, 2));
    
    // Check if this is a message update
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
    
    // Return a '200 OK' response to all events
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Laika CX Support Bot is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});
