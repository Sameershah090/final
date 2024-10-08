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

app.get('/download/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await bot.getFile(fileId);
    
    if (!file || !file.file_path) {
      return res.status(404).send('File not found');
    }

    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return res.status(response.status).send('Error fetching file from Telegram');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.file_path.split('/').pop()}"`);
    res.setHeader('Content-Type', response.headers.get('content-type'));

    response.body.pipe(res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
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
