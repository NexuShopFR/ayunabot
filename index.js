require('dotenv').config();
require('./keepAlive');
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
} = require('discord.js');

const { 
  GUILD_ID,
  WELCOME_CHANNEL_ID,
  TICKET_CHANNEL_ID,
  LOG_CHANNEL_ID,
  BOT_TOKEN
} = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
const fs = require('fs');
const path = require('path');

// 💬 Charger commandes texte
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// ✅ Quand le bot démarre
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'NexuShop', type: 3 }],
    status: 'dnd'
  });

  // 🎫 Envoi du menu de ticket
  const sendTicketMenu = require('./utils/sendTicketMenu');
  sendTicketMenu(client);
});

// 👋 Bienvenue
const welcomeEmbed = require('./utils/welcomeEmbed');
client.on('guildMemberAdd', member => welcomeEmbed(member));

// 📩 Création ticket
const ticketHandler = require('./utils/ticketHandler');
client.on('interactionCreate', i => {
  if (i.isStringSelectMenu()) ticketHandler(i);
});

// 🛠 Boutons (claim/close)
const buttonHandler = require('./utils/buttonHandler');
client.on('interactionCreate', i => {
  if (i.isButton()) buttonHandler(i);
});

// ⚙️ Commandes texte (ban, mute, etc.)
client.on('messageCreate', async message => {
  if (!message.content.startsWith('.') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (command) {
    try {
      await command.execute(message, args);
    } catch (err) {
      console.error(err);
      message.reply('❌ There was an error executing this command.');
    }
  }
});

client.login(BOT_TOKEN);
