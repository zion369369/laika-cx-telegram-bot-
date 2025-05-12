# Laika CX Telegram Chatbot

A Node.js Express application that acts as a customer support chatbot for Laika CX on Telegram.

## Features

- Webhook integration with Telegram Bot API
- Automatic responses powered by DeepSeek AI
- FAQ-based customer support
- Message logging

## Setup

1. Clone this repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file based on `.env.example` and fill in your credentials:
```
PORT=3000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```
4. Make sure to move the DeepSeek API key from `server.js` to the `.env` file for production use

## Running the Application

Start the server:
```
npm start
```

For development with auto-reload:
```
npm run dev
```

## Webhook Setup

1. Create a new bot on Telegram by messaging [@BotFather](https://t.me/BotFather)
2. Get your bot token from BotFather and add it to your `.env` file
3. Set up your webhook using the Telegram Bot API:
   ```
   https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://your-server.com/webhook
   ```
4. Make sure your server is accessible from the internet (using ngrok, Heroku, etc.)

## Laika CX Integration

This chatbot is designed to provide customer support for Laika CX on the Telegram platform.
