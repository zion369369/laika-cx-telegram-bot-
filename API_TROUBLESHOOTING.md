# DeepSeek API Troubleshooting Guide

## Current Issues
Based on our analysis, the bot is likely falling back to rule-based responses because it's unable to successfully connect to the DeepSeek API. Here are the potential issues and solutions:

## 1. API Key Issues

### Check if your API key is valid
The current API key is: `sk-8e3db7a1fabe4f4a8bb44348d2761343`

To verify if this key is valid:
1. Try making a direct API call using cURL or Postman
2. Check if your DeepSeek account is active and has available credits
3. Generate a new API key from the DeepSeek dashboard if necessary

### API Key Format
We've already implemented format checking in the code, which attempts both with and without the `sk-` prefix.

## 2. Network/Firewall Issues

### Check if Render.com can access the DeepSeek API
- Some cloud platforms have restrictions on outgoing connections
- Check Render's logs to see specific network errors

### Proxy Issues
If using a proxy:
- Ensure the proxy is correctly configured 
- Try running the bot without a proxy temporarily for testing

## 3. API Endpoint Verification

We have tried three different endpoints:
1. `https://api.deepseek.com/v1/chat/completions`
2. `https://api.deepseek.ai/v1/chat/completions`
3. `https://api.deepinfra.com/v1/openai/chat/completions` (with model `deepseek-ai/deepseek-chat-v1`)

### To debug which endpoint works:
1. Check the logs from the running application
2. Look for specific error messages related to each endpoint
3. Test each endpoint individually with cURL commands:

```bash
# Test primary endpoint
curl --location 'https://api.deepseek.com/v1/chat/completions' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--data '{
    "model": "deepseek-chat",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Hello"
        }
    ],
    "temperature": 0.7,
    "max_tokens": 500
}'
```

## 4. Alternative Solutions

### Try a different API provider
If DeepSeek continues to give issues, consider alternatives:
1. **OpenAI GPT API** - Widely adopted and reliable
2. **Google Vertex AI / Gemini** - Good performance and reliability
3. **Anthropic Claude API** - High quality responses with strong capabilities

### Update the code to use an alternative provider
The changes would be minimal - mostly updating the API endpoint and request format.

## 5. Monitoring and Debugging

### Enhanced Logging
We've added extensive logging to help diagnose issues:
- Check the server logs to see which API attempts failed
- Look for specific error messages and status codes
- Watch for timeout errors that might indicate network issues

### Testing Without Deployment
Test the API connection locally before deploying to Render:

```bash
# Set your API key locally
export DEEPSEEK_API_KEY=your_api_key

# Run the bot locally
node fallback_bot.js
```

## Next Steps

1. Check the logs from the running service to identify specific error messages
2. Verify API key validity and generate a new one if needed
3. Test API endpoints directly to identify which one works
4. Consider switching to an alternative AI provider if DeepSeek continues to fail
5. Update the API implementation based on the findings
