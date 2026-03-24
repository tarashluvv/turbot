const express = require('express');
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');

const app = express();
let currentQR = null;
let isReady = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const keywords = ['жалгас', 'тарш', 'нуасы'];
const TARGET_GROUP = 'jabai';

client.on('qr', async (qr) => {
    qrcodeTerminal.generate(qr, { small: true });
    currentQR = qr;
    isReady = false;
    console.log('QR code generated, scan with WhatsApp');
});

client.on('ready', () => {
    isReady = true;
    currentQR = null;
    console.log('bot is running');
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();

    if (!chat.isGroup || chat.name !== TARGET_GROUP) return;

    const text = msg.body.toLowerCase();
    const found = keywords.find(word => text.includes(word));

    if (found) {
        await msg.reply(`${found} котакбас`);
    }
});

app.get('/', async (req, res) => {
    if (isReady) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp Bot</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                    .status { color: green; font-size: 24px; }
                </style>
            </head>
            <body>
                <h1>WhatsApp Bot</h1>
                <p class="status">✓ Bot is authenticated and running</p>
                <p>Listening for keywords in the "${TARGET_GROUP}" group</p>
            </body>
            </html>
        `);
    }

    if (!currentQR) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp Bot</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                </style>
            </head>
            <body>
                <h1>WhatsApp Bot</h1>
                <p>Initializing... Please wait</p>
                <meta http-equiv="refresh" content="2">
            </body>
            </html>
        `);
    }

    try {
        const qrImage = await QRCode.toDataURL(currentQR);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp Bot QR Code</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; }
                    img { max-width: 400px; border: 2px solid #ccc; padding: 10px; }
                    .instruction { margin-top: 20px; font-size: 16px; }
                </style>
            </head>
            <body>
                <h1>WhatsApp Bot Authentication</h1>
                <p>Scan this QR code with WhatsApp on your phone:</p>
                <img src="${qrImage}" alt="QR Code">
                <div class="instruction">
                    <p>1. Open WhatsApp on your phone</p>
                    <p>2. Go to Settings → Linked Devices</p>
                    <p>3. Scan the QR code above</p>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Error generating QR code');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.initialize();
