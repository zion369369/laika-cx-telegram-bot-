# Setting Up Your Telegram Bot Without npm

Since you're facing PowerShell script execution restrictions, here's how to set up your bot without npm:

## 1. Manual Node.js Installation

- Download and install Node.js from [nodejs.org](https://nodejs.org/en/download)

## 2. Manual Package Installation

You need to manually install the required packages. Open Command Prompt as Administrator and run:

```
cd c:\Users\user\Desktop\Laika CX AI
npm install express dotenv axios
```

If you still face permission issues, try these alternatives:

- Download the packages manually from npmjs.com and place them in a "node_modules" folder
- Use a different machine to create the node_modules folder, then copy it to this project

## 3. Set Up Telegram Webhook

To set up your webhook without using ngrok, you need a publicly accessible server. If you don't have one, you can use a free service like:

- [Replit](https://replit.com)
- [Glitch](https://glitch.com)
- [Render](https://render.com)

Once you have a public URL, set your webhook using this URL in any web browser:
```
https://api.telegram.org/bot7577088151:AAHCGlXcowq0c4CoAZ3_AM-cV9f-qfl7-BU/setWebhook?url=YOUR_PUBLIC_URL/webhook
```

## 4. Running Locally for Testing

You can still run the bot locally using the batch file:

```
start.bat
```

But for Telegram to send webhooks to your bot, you need a public URL.

## 5. Alternative: Use Polling Instead of Webhooks

If setting up a webhook is challenging, you can modify the bot to use polling instead.
