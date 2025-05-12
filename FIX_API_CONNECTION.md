# Fixing Laika CX Bot API Connection Issues

Based on our analysis, your Telegram bot is defaulting to rule-based responses because it cannot connect to the DeepSeek API. Here are the steps to troubleshoot and fix these issues:

## 1. Test API Connection

First, run the API connection test script to identify if any of the endpoints work:

```bash
node test_api_connection.js
```

This will test all three API endpoints we've configured and provide detailed error information.

## 2. Update Your API Key

If the tests fail, you should obtain a new API key:

1. Visit the DeepSeek AI dashboard and generate a new API key
2. Update your key using the provided script:

```bash
node update_api_key.js YOUR_NEW_API_KEY
```

This script will update the key in all necessary files.

## 3. Make Changes to the Code if Needed

We've already made several improvements to the code:

1. Enhanced error logging to pinpoint connection issues
2. Added additional API endpoints (3 in total) to try different connection methods
3. Improved fallback response quality while diagnosing API issues
4. Extended timeout periods to allow for slow connections

## 4. Alternative AI API Options

If DeepSeek API continues to fail, you can switch to an alternative API provider:

### OpenAI GPT API
Update the API implementation to use OpenAI's interface:

```javascript
const response = await axios.post('https://api.openai.com/v1/chat/completions', {
  model: "gpt-3.5-turbo",
  messages: [
    { role: 'system', content: prompt }
  ],
  temperature: 0.7,
  max_tokens: 500
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  },
  timeout: 20000
});

return response.data.choices[0].message.content;
```

### Google AI (Gemini) API
For Google's Gemini API, you would need to adapt the code:

```javascript
const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500
  }
}, {
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': GOOGLE_API_KEY
  },
  timeout: 20000
});

return response.data.candidates[0].content.parts[0].text;
```

## 5. Deploying the Fixed Version

After making changes:

1. Test locally:
```bash
node fallback_bot.js
```

2. Push to GitHub:
```bash
git add .
git commit -m "Fix API connection issues and enhance error handling"
git push
```

3. Deploy to Render.com either manually or via GitHub integration

4. Verify the deployment logs for any errors

## 6. Monitoring and Maintenance

Once deployed:

1. Monitor logs on Render.com to identify any ongoing issues
2. Check if responses are AI-generated rather than fallback responses
3. Periodically test the connection to DeepSeek API to ensure it's working

## Next Steps

If you've implemented these changes and still experience issues:

1. Review the detailed errors in API_TROUBLESHOOTING.md
2. Consider reaching out to DeepSeek support about API availability
3. Switch to an alternative AI provider if necessary
