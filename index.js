require('dotenv').config();
require('./keepAlive');

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  AuditLogEvent
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const antiAdFilter = require('./utils/antiAdFilter');
const antiSpamFilter = require('./utils/antiSpamFilter');

const {
  BOT_TOKEN,
  STAFF_ROLE_ID,
  TICKET_LOG_CHANNEL_ID,
  MODERATION_LOG_CHANNEL_ID
} = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
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

// 🧾 Logs personnalisés
client.on('messageDelete', async message => {
  if (!message.guild || message.author?.bot) return;
  const channel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setTitle('🗑️ Message supprimé')
    .setDescription(`**Auteur :** ${message.author}
**Salon :** ${message.channel}
**Contenu :** ${message.content || 'Aucun contenu'}`)
    .setColor('Orange')
    .setTimestamp();
  channel.send({ embeds: [embed] });
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
  if (!newMsg.guild || newMsg.author?.bot) return;
  if (oldMsg.content === newMsg.content) return;
  const channel = newMsg.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setTitle('✏️ Message modifié')
    .setDescription(`**Auteur :** ${newMsg.author}
**Salon :** ${newMsg.channel}`)
    .addFields(
      { name: 'Avant', value: oldMsg.content || 'Vide' },
      { name: 'Après', value: newMsg.content || 'Vide' }
    )
    .setColor('Yellow')
    .setTimestamp();
  channel.send({ embeds: [embed] });
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setTitle('📥 Nouveau membre')
    .setDescription(`Bienvenue à ${member.user.tag}`)
    .setThumbnail(member.user.displayAvatarURL())
    .setColor('Green')
    .setTimestamp();
  channel.send({ embeds: [embed] });
});

client.on('guildMemberRemove', async member => {
  const channel = member.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setTitle('📤 Départ membre')
    .setDescription(`${member.user.tag} a quitté le serveur.`)
    .setColor('Red')
    .setTimestamp();
  channel.send({ embeds: [embed] });
});

// 💬 Commandes texte + tickets + anti-pub
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  antiAdFilter(message);
  antiSpamFilter(message);

  const content = message.content.trim();
  const args = content.split(/ +/);
  const cmd = args.shift().toLowerCase();

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  const ticketLogChannel = message.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);

  // 🟣 Commandes classiques avec +
  if (content.startsWith('+')) {
    const commandName = cmd.slice(1);
    const command = client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(message, args);
        await message.delete().catch(() => {});
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

  if (cmd === '+rename') {
    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!newName || newName.length < 3) {
      return message.reply('❌ Donnez un nom valide. Exemple : `+rename livraison-pb`');
    }

    await message.channel.setName(`ticket-${newName}`);
    const confirmation = await message.reply(`✅ Nom du ticket mis à jour en \`ticket-${newName}\``);

    const embed = new EmbedBuilder()
      .setTitle('✏️ Ticket renommé')
      .setDescription(`Ticket renommé par ${message.author} → \`ticket-${newName}\``)
      .setColor('Blue')
      .setTimestamp();

    if (ticketLogChannel) await ticketLogChannel.send({ embeds: [embed] });

    setTimeout(() => {
      message.delete().catch(() => {});
      confirmation.delete().catch(() => {});
    }, 3000);

    return;
  }
});

client.login(BOT_TOKEN);
