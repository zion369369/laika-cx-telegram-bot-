# Laika CX Deployment Checklist

Use this checklist to ensure your Telegram bot deploys correctly on Render.

## Environment Settings

- [ ] Set deployment environment to **Node.js**
- [ ] Set start command to `node fallback_bot.js`
- [ ] Add environment variables:
  - [ ] `TELEGRAM_BOT_TOKEN=7577088151:AAHCGlXcowq0c4CoAZ3_AM-cV9f-qfl7-BU`
  - [ ] `DEEPSEEK_API_KEY=sk-8e3db7a1fabe4f4a8bb44348d2761343`

## API Key Verification

- [ ] DeepSeek API key format: `sk-8e3db7a1fabe4f4a8bb44348d2761343`
- [ ] Key is correctly set in environment variables
- [ ] Bot code includes fallback handling for API failures

## Bot Functionality

- [ ] Bot responds to messages on Telegram
- [ ] API calls are working correctly
- [ ] Fallback local responses work if API fails
- [ ] FAQs are loaded correctly

## Deployment Flow

1. Push all files to GitHub repository
2. Connect Render to GitHub repository
3. Create new Web Service in Render
4. Set environment to Node.js
5. Set start command to `node fallback_bot.js`
6. Add environment variables
7. Deploy
8. Check logs for any errors
9. Test bot on Telegram

## Files Required

- [x] fallback_bot.js
- [x] package.json
- [x] faqs.json
- [x] .env (optional, variables can be set in Render UI)
- [x] render.yaml (for automatic configuration)

## Troubleshooting

If you encounter problems:
1. Check Render logs
2. Verify API key format
3. Check if fallback responses work
4. Make sure your service is configured as Node.js, not Python
