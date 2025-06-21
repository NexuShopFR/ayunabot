const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');
require('dotenv').config();

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
const MODERATION_LOG_CHANNEL_ID = process.env.MODERATION_LOG_CHANNEL_ID;

function isStaff(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

function buildEmbed({ title, description, color = 'Red', image, footer }) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);

  if (image) embed.setImage(image);
  if (footer) embed.setFooter({ text: footer });

  return embed;
}

async function tryDM(user, embed) {
  try {
    await user.send({ embeds: [embed] });
  } catch {}
}

async function sendModLog(guild, embed) {
  const channel = guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (channel) await channel.send({ embeds: [embed] });
}

module.exports = {
  name: 'moderation',
  async execute(message, args) {
    const cmd = args.shift()?.toLowerCase();
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    if (!cmd || !target) {
      return message.reply('Utilisation: `.moderation [ban|kick|mute|unmute|warn|clear|setup-ticket] <@user> [raison]`');
    }

    if (!isStaff(message.member)) return message.reply('❌ Vous n’avez pas la permission.');
    if (isStaff(target)) return message.reply('❌ Vous ne pouvez pas exécuter cette commande sur un autre membre du staff.');

    const embedDM = buildEmbed({
      title: `🔔 ${cmd.charAt(0).toUpperCase() + cmd.slice(1)} Notification`,
      description: `Vous avez été **${cmd}** du serveur **${message.guild.name}**.

Raison: ${reason}`,
      image: 'https://auto.creavite.co/api/out/DHwodsxyi3Vbsy7gn8_standard.gif',
      footer: 'Support: discord.gg/nexushop'
    });

    const embedLog = buildEmbed({
      title: `✅ ${cmd.toUpperCase()} Effectué`,
      description: `${target} a été ${cmd} par ${message.author}

**Raison:** ${reason}`,
      color: 'Orange'
    });

    switch (cmd) {
      case 'ban':
        await tryDM(target.user, embedDM);
        await target.ban({ reason });
        await sendModLog(message.guild, embedLog);
        break;

      case 'kick':
        await tryDM(target.user, embedDM);
        await target.kick(reason);
        await sendModLog(message.guild, embedLog);
        break;

      case 'warn':
        await tryDM(target.user, embedDM);
        await sendModLog(message.guild, embedLog);
        message.reply(`${target} a été averti.`);
        break;

      case 'mute': {
        const duration = args[0];
        if (!duration || !/\d+[smhd]/.test(duration)) {
          return message.reply('Format: `.moderation mute @user 10m [raison]`');
        }
        await tryDM(target.user, embedDM);
        await target.timeout(ms(duration), reason);
        await sendModLog(message.guild, embedLog);
        break;
      }

      case 'unmute':
        await tryDM(target.user, embedDM);
        await target.timeout(null);
        await sendModLog(message.guild, embedLog);
        break;

      case 'clear': {
        const count = parseInt(args[0], 10);
        if (!count || count < 1 || count > 100) {
          return message.reply('Choisissez un nombre entre 1 et 100.');
        }
        await message.channel.bulkDelete(count, true);
        embedLog.setDescription(`${message.author} a supprimé **${count}** messages.`);
        await sendModLog(message.guild, embedLog);
        break;
      }

      case 'setup-ticket':
        if (message.author.id !== message.guild.ownerId) {
          return message.reply('Seul le propriétaire du serveur peut utiliser cette commande.');
        }
        const setupTicket = require('../utils/sendTicketMenu');
        setupTicket(message.client);
        message.reply('🎫 Système de ticket initialisé.');
        break;

      default:
        message.reply('❌ Commande non reconnue.');
    }
  }
};
