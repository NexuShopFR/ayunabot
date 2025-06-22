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
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'NexuShop', type: 3 }],
    status: 'dnd'
  });

  const sendTicketMenu = require('./utils/sendTicketMenu');
  sendTicketMenu(client);
});

// 🎉 Bienvenue + anti-alt
const welcomeEmbed = require('./utils/welcomeEmbed');
client.on('guildMemberAdd', async member => {
  const ageLimit = 1000 * 60 * 60 * 3;
  if (Date.now() - member.user.createdTimestamp < ageLimit) {
    try {
      await member.send(`🚫 Votre compte est trop récent pour rejoindre **${member.guild.name}**.`);
    } catch {}
    return await member.kick('Compte trop récent (anti-alt)');
  }

  welcomeEmbed(member);
});

// 💬 Commandes classiques +close / +rename + modération
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  antiAdFilter(message);
  antiSpamFilter(message);

  const content = message.content.trim();
  const args = content.split(/\s+/);
  const cmd = args.shift().toLowerCase();

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  const ticketLogChannel = message.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);

  if (cmd.startsWith('+')) {
    const commandName = cmd.slice(1);
    const command = client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(message, args);
      } catch (err) {
        console.error(err);
        const errorMsg = await message.reply('❌ Une erreur est survenue pendant l’exécution.');
        setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
      }
    }
    return;
  }

  // Tickets : commandes textuelles dans salon
  if (!message.channel.name?.startsWith('ticket-')) return;
  const ticketOwner = message.channel.name.replace('ticket-', '');
  const isTicketOwner = ticketOwner === message.author.username.toLowerCase();
  if (!isStaff && !isTicketOwner) return;

  if (cmd === '+close') {
    const embed = new EmbedBuilder()
      .setTitle('🎟️ Ticket Fermé')
      .setDescription(`Le ticket **${message.channel.name}** a été fermé par ${message.author}`)
      .setColor('Red')
      .setTimestamp();
    if (ticketLogChannel) ticketLogChannel.send({ embeds: [embed] });
    await message.channel.send('✅ Fermeture dans 3 secondes...');
    return setTimeout(() => message.channel.delete().catch(() => {}), 3000);
  }

  if (cmd === '+rename') {
    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!newName || newName.length < 3) {
      return message.reply('❌ Nom invalide. Exemple : `+rename livraison-pb`');
    }

    await message.channel.setName(`ticket-${newName}`);
    const confirm = await message.reply(`✅ Nouveau nom : \`ticket-${newName}\``);

    const embed = new EmbedBuilder()
      .setTitle('✏️ Ticket renommé')
      .setDescription(`Ticket renommé par ${message.author} → \`ticket-${newName}\``)
      .setColor('Blue')
      .setTimestamp();

    if (ticketLogChannel) ticketLogChannel.send({ embeds: [embed] });

    setTimeout(() => {
      message.delete().catch(() => {});
      confirm.delete().catch(() => {});
    }, 3000);
  }
});

// 🧾 Logs suppression/modif/départ
client.on('messageDelete', async message => {
  if (!message.guild || message.author?.bot) return;
  const log = new EmbedBuilder()
    .setTitle('🗑️ Message supprimé')
    .setDescription(`**Auteur :** ${message.author}\n**Salon :** ${message.channel}\n**Contenu :** ${message.content || 'Aucun contenu'}`)
    .setColor('Orange')
    .setTimestamp();

  const channel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (channel) channel.send({ embeds: [log] });
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
  if (!newMsg.guild || newMsg.author?.bot || oldMsg.content === newMsg.content) return;
  const log = new EmbedBuilder()
    .setTitle('✏️ Message modifié')
    .addFields(
      { name: 'Avant', value: oldMsg.content || 'Vide' },
      { name: 'Après', value: newMsg.content || 'Vide' }
    )
    .setDescription(`**Auteur :** ${newMsg.author}\n**Salon :** ${newMsg.channel}`)
    .setColor('Yellow')
    .setTimestamp();

  const channel = newMsg.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (channel) channel.send({ embeds: [log] });
});

client.on('guildMemberRemove', async member => {
  const embed = new EmbedBuilder()
    .setTitle('📤 Départ membre')
    .setDescription(`${member.user.tag} a quitté le serveur.`)
    .setColor('Red')
    .setTimestamp();

  const channel = member.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (channel) channel.send({ embeds: [embed] });
});

// 🧪 Interactions (debug)
const ticketHandler = require('./utils/ticketHandler');
const buttonHandler = require('./utils/buttonHandler');

client.on('interactionCreate', i => {
  if (i.isStringSelectMenu()) {
    console.log("📥 Menu sélectionné :", i.customId, i.values);
    ticketHandler(i);
  } else if (i.isButton()) {
    console.log("🔘 Bouton cliqué :", i.customId);
    buttonHandler(i);
  }
});

client.login(BOT_TOKEN);
