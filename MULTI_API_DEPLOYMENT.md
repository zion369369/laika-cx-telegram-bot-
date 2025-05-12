# Multi-API Bot Deployment Guide

This guide will help you deploy the enhanced Multi-API Telegram bot for Laika CX, which can use multiple AI providers (DeepSeek, Hugging Face, OpenAI) for maximum reliability.

## Why Use the Multi-API Bot?

The Multi-API Bot offers several advantages:

1. **High Availability**: If one API service is down or experiencing issues, the bot automatically falls back to alternative services
2. **Cost Optimization**: You can prioritize less expensive APIs while having premium APIs as a backup
3. **Enhanced Reliability**: The bot keeps track of API failures and prioritizes the most reliable services
4. **Graceful Degradation**: Even if all AI services are unavailable, the bot falls back to a rule-based system

## Deployment Steps

### 1. Add API Keys (Optional but Recommended)

While the bot works with only DeepSeek, adding additional API keys improves reliability:

1. **Hugging Face API Key**:
   - Create a free account at [huggingface.co](https://huggingface.co)
   - Go to Settings > Access Tokens > New Token
   - Create a token with "read" role
   - Add to your .env file as `HUGGINGFACE_API_KEY=your_token_here`

2. **OpenAI API Key**:
   - Create an account at [platform.openai.com](https://platform.openai.com)
   - Go to API Keys section and create a new key
   - Add to your .env file as `OPENAI_API_KEY=your_token_here`

### 2. Test API Connections

Before deployment, test your API connections:

```bash
node test_api_connection.js
```

This will test all configured APIs and tell you which ones are working.

### 3. Deploy to Render.com

1. Log in to your Render.com account
2. Connect your GitHub repository or upload the code
3. Create a new Web Service with these settings:
   - Build Command: `npm install`
   - Start Command: `node multi_api_bot.js`
   - Environment Variables:
     - `TELEGRAM_BOT_TOKEN` (required)
     - `DEEPSEEK_API_KEY` (required)
     - `HUGGINGFACE_API_KEY` (optional)
     - `OPENAI_API_KEY` (optional)

4. Deploy the service

### 4. Verifying Deployment

After deployment:

1. Check the Render logs for any errors
2. Send a message to your Telegram bot to test responses
3. Verify that the bot responds with AI-generated answers

## Monitoring & Maintenance

The Multi-API Bot includes built-in monitoring features:

- **API Failure Tracking**: The bot counts failures for each API and prioritizes the most reliable ones
- **Automatic Retry**: Every hour, the bot resets failure counts to allow retrying previously failed APIs
- **Detailed Logging**: The bot logs which API it's using for each request, making troubleshooting easier

## Troubleshooting

If you experience issues:

1. Check the Render logs for specific errors
2. Run `node test_api_connection.js` locally to test all APIs
3. Verify that your API keys are valid and have sufficient credits
4. Check if Render.com is blocking outgoing connections (rare but possible)

## Future Improvements

Consider these future enhancements:

1. Add more AI providers for even greater redundancy
2. Implement response quality scoring to prioritize the best APIs
3. Add dynamic switching based on response time
4. Create an admin interface to monitor API performance

## Support

If you need further assistance, please contact the development team or open an issue on GitHub.
