require('dotenv').config();
require('./keepAlive');

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const antiAdFilter = require('./utils/antiAdFilter'); // ✅ Ici, chargé une seule fois

const {
  BOT_TOKEN,
  STAFF_ROLE_ID,
  TICKET_LOG_CHANNEL_ID
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

// 📦 Commandes dans /commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// ✅ Bot prêt
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'NexuShop', type: 3 }],
    status: 'dnd'
  });

  const sendTicketMenu = require('./utils/sendTicketMenu');
  sendTicketMenu(client);
});

// 👋 Nouveau membre
const welcomeEmbed = require('./utils/welcomeEmbed');
client.on('guildMemberAdd', member => welcomeEmbed(member));

// 📩 Tickets (menus)
const ticketHandler = require('./utils/ticketHandler');
client.on('interactionCreate', i => {
  if (i.isStringSelectMenu()) ticketHandler(i);
});

// 🛠 Boutons (claim/close)
const buttonHandler = require('./utils/buttonHandler');
client.on('interactionCreate', i => {
  if (i.isButton()) buttonHandler(i);
});

// 💬 Commandes texte + tickets + anti-pub
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  // 🔒 Anti pub (discord.gg ou invitations)
  antiAdFilter(message);

  const content = message.content.trim();
  const args = content.split(/ +/);
  const cmd = args.shift().toLowerCase();

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  const ticketLogChannel = message.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);

  // 🟣 Commandes classiques
  if (content.startsWith('.')) {
    const commandName = cmd.slice(1);
    const command = client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(message, args);
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue lors de l’exécution de la commande.');
      }
    }
    return;
  }

  // 🟡 Commandes ticket : +rename / +close
  if (!message.channel.name?.startsWith('ticket-')) return;

  const ticketOwner = message.channel.name.replace('ticket-', '');
  const isTicketOwner = ticketOwner === message.author.username.toLowerCase();
  if (!isStaff && !isTicketOwner) return;

  // ➕ Fermer un ticket
  if (cmd === '+close') {
    const embed = new EmbedBuilder()
      .setTitle('🎟️ Ticket Fermé')
      .setDescription(`Le ticket **${message.channel.name}** a été fermé par ${message.author}.`)
      .setColor('Red')
      .setTimestamp();

    if (ticketLogChannel) await ticketLogChannel.send({ embeds: [embed] });

    await message.channel.send('✅ Fermeture du ticket dans 3 secondes...');
    setTimeout(() => message.channel.delete().catch(() => {}), 3000);
    return;
  }

  // ➕ Renommer un ticket
  if (cmd === '+rename') {
    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!newName || newName.length < 3) {
      return message.reply('❌ Donnez un nom valide. Exemple : `+rename livraison-pb`');
    }

    await message.channel.setName(`ticket-${newName}`);
    await message.reply(`✅ Nom du ticket mis à jour en \`ticket-${newName}\``);

    const embed = new EmbedBuilder()
      .setTitle('✏️ Ticket renommé')
      .setDescription(`Ticket renommé par ${message.author} → \`ticket-${newName}\``)
      .setColor('Blue')
      .setTimestamp();

    if (ticketLogChannel) await ticketLogChannel.send({ embeds: [embed] });
    return;
  }
});

// 🚀 Login
client.login(BOT_TOKEN);
