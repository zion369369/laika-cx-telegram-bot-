# Deploying Your Laika CX Telegram Bot to Render

This guide will help you deploy your Telegram bot to Render.com without needing to set up webhooks.

## Step 1: Create a Render Account

1. Go to [Render.com](https://render.com) and sign up for a free account
2. Verify your email address

## Step 2: Create a New Web Service

1. Log into your Render dashboard
2. Click on the "New +" button in the top right corner
3. Select "Web Service" from the dropdown menu

## Step 3: Deploy Your Files

You have two options for deployment:

### Option A: Deploy from GitHub (Recommended)

1. Connect your GitHub account to Render (if prompted)
2. Select "Deploy from GitHub repo"
3. Configure access to your repositories
4. Select your repository (or create one and push your code first)
5. **IMPORTANT:** Make sure Render detects this as a Node.js project, not Python

### Option B: Deploy Manually

1. Choose "Deploy from public Git repository" 
2. You'll need to upload your files to a public Git repo first (GitHub, GitLab, etc.)
3. Enter the repository URL: `https://github.com/zion369369/laika-cx-telegram-bot-`
4. **IMPORTANT:** Make sure Render detects this as a Node.js project, not Python

## Step 4: Configure Your Web Service

Fill in the following details:
- **Name**: `laika-cx-telegram-bot` (or any name you prefer)
- **Region**: Select the closest region to you
- **Branch**: `main` (or your main branch name)
- **Environment**: `Node` (THIS IS CRITICAL - make sure it's not set to Python)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node fallback_bot.js`  # Use this for better reliability

**IMPORTANT NOTE**: If Render is trying to use Python instead of Node.js, you need to:
1. In the dashboard, under "Settings" 
2. Look for "Runtime Environment" 
3. Change it from "Python" to "Node"

## Step 5: Add Environment Variables

1. Scroll down to the "Environment" section
2. Add the following environment variables:
   - Key: `TELEGRAM_BOT_TOKEN`
   - Value: `7577088151:AAHCGlXcowq0c4CoAZ3_AM-cV9f-qfl7-BU`
   
   - Key: `DEEPSEEK_API_KEY`
   - Value: `sk-8e3db7a1fabe4f4a8bb44348d2761343`

## Step 6: Deploy Your Service

1. Click on "Create Web Service"
2. Wait for Render to build and deploy your app (this may take a few minutes)

## Step 7: Verify Your Deployment

1. Once deployment is complete, Render will provide you with a URL for your service
2. Your bot should now be running and responding to messages

## Keeping Your Bot Running 24/7

One of the advantages of Render is that free tier web services remain active, unlike Replit which requires a keep-alive mechanism. Your bot should run continuously on Render without any additional configuration.

## Troubleshooting

If your bot doesn't respond:

1. Check the Render logs for any errors
2. Verify your bot token is correct
3. Make sure the build and start commands are correct
4. Try messaging your bot on Telegram to see if it responds

Your bot should now be running 24/7 on Render without needing webhooks!
