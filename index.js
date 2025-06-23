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

// 📂 Chargement des commandes
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command?.name && typeof command.execute === 'function') {
    client.commands.set(command.name, command);
    console.log(`✅ Commande chargée : ${command.name}`);
  } else {
    console.warn(`⚠️ Mauvais format de commande : ${file}`);
  }
}

client.once('ready', () => {
  console.log(`🟢 Connecté en tant que ${client.user.tag}`);
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

// 💬 Gestion des messages
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  antiAdFilter(message);
  antiSpamFilter(message);

  const content = message.content.trim();
  const args = content.split(/\s+/);
  const cmd = args.shift().toLowerCase();

  if (!cmd.startsWith('+')) return;

  const commandName = cmd.slice(1);
  const command = client.commands.get(commandName);
  if (!command) {
    console.warn(`❓ Commande inconnue : ${commandName}`);
    return;
  }

  try {
    await command.execute(message, args);
    await message.delete().catch(() => {});
  } catch (err) {
    console.error(`❌ Erreur dans la commande ${commandName} :`, err);
    const errorMsg = await message.reply('❌ Une erreur est survenue pendant l’exécution.');
    setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
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

// 🔘 Menus et boutons tickets
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
