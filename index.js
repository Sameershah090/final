import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;
const botToken = process.env.BOT_TOKEN;
const appUrl = process.env.APP_URL;

if (!botToken) {
  console.error('BOT_TOKEN is not set. Please set it as an environment variable.');
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

app.get('/', (req, res) => {
  res.send('Telegram File Proxy Bot is running!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/testbot', async (req, res) => {
  try {
    const me = await bot.getMe();
    res.json(me);
  } catch (error) {
    console.error('Error testing bot:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/download/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    console.log(`Attempting to download file with ID: ${fileId}`);
    
    let file;
    try {
      file = await bot.getFile(fileId);
    } catch (getFileError) {
      console.error('Error getting file from Telegram:', getFileError);
      return res.status(500).send(`Error getting file from Telegram: ${getFileError.message}`);
    }
    
    if (!file || !file.file_path) {
      console.error(`File not found for ID: ${fileId}`);
      return res.status(404).send('File not found');
    }

    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    console.log(`Fetching file from URL: ${fileUrl}`);
    
    let response;
    try {
      response = await fetch(fileUrl);
    } catch (fetchError) {
      console.error('Error fetching file:', fetchError);
      return res.status(500).send(`Error fetching file: ${fetchError.message}`);
    }

    if (!response.ok) {
      console.error(`Error fetching file from Telegram. Status: ${response.status}`);
      return res.status(response.status).send(`Error fetching file from Telegram: ${response.statusText}`);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.file_path.split('/').pop()}"`);
    res.setHeader('Content-Type', response.headers.get('content-type'));

    response.body.pipe(res);
  } catch (error) {
    console.error('Unexpected error in download route:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

bot.on('document', (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;
  const downloadUrl = `${appUrl}/download/${fileId}`;
  
  bot.sendMessage(chatId, `Download your file here: ${downloadUrl}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
