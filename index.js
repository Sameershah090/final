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

export default function Component() {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Telegram File Proxy Bot</h1>
      <p className="mb-2">This is the main application file that:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Sets up an Express server</li>
        <li>Creates a Telegram bot instance</li>
        <li>Handles file download requests</li>
        <li>Responds to document messages with download links</li>
      </ul>
      <p className="text-sm text-gray-600">Note: Make sure to set the BOT_TOKEN and APP_URL environment variables.</p>
    </div>
  );
}
