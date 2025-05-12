# Deploying Your Laika CX Telegram Bot to Replit

This guide will help you deploy your Telegram bot to Replit without needing to set up webhooks.

## Step 1: Create a Replit Account

1. Go to [Replit.com](https://replit.com) and sign up for a free account
2. Verify your email address

## Step 2: Create a New Repl

1. Click on "+ Create Repl" button
2. Select "Import from GitHub" (or choose "Node.js" if you prefer to upload files manually)
3. If using GitHub:
   - Create a GitHub repository first and push your code there
   - Enter your repository URL
4. If using manual upload:
   - Select "Node.js" as the template
   - Name your Repl (e.g., "laika-cx-telegram-bot")
   - Click "Create Repl"

## Step 3: Upload Your Files (if using manual method)

1. Delete any default files like "index.js"
2. Upload all project files:
   - polling_bot.js
   - package.json
   - faqs.json
   - .replit
   - replit.nix
   - .env (you'll need to create this with your token)

## Step 4: Set Up Environment Variables

1. Click on the "Secrets" tool in the left sidebar (lock icon)
2. Add a new secret:
   - Key: TELEGRAM_BOT_TOKEN
   - Value: 7577088151:AAHCGlXcowq0c4CoAZ3_AM-cV9f-qfl7-BU

## Step 5: Install Dependencies

1. In the Replit Shell, run:
   ```
   npm install express dotenv axios
   ```

## Step 6: Run Your Bot

1. Click the "Run" button at the top of the screen
2. Your bot will start in polling mode
3. The console should show "Starting Laika CX Telegram Bot in polling mode..."

## Step 7: Keep Your Bot Running 24/7 (Optional)

For free Replit accounts, your bot will "sleep" after inactivity. There are two options:

1. **Use the built-in keep-alive function:** This is already included in the polling_bot.js file.

2. **Set up an external ping service:**
   - Create an account on [UptimeRobot](https://uptimerobot.com)
   - Add a new monitor of type "HTTP(s)"
   - Enter your Replit URL (found at the top right of your Replit window)
   - Set the monitoring interval to 5 minutes

## Troubleshooting

If your bot doesn't respond:

1. Check the Replit console for error messages
2. Verify your bot token is correct
3. Make sure the bot is actually running (check the console)
4. Try messaging your bot on Telegram to see if it responds

Your bot should now be running 24/7 on Replit without needing webhooks!
