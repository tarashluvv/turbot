const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// add your keywords here
const keywords = ['жалгас', 'тарш', 'нуасы'];

// replace with your exact group name
const TARGET_GROUP = 'jabai';

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('scan the qr code above with your whatsapp');
});

client.on('ready', () => {
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

client.initialize();
