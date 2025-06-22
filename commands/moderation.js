// moderation.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');
require('dotenv').config();

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
const MODERATION_LOG_CHANNEL_ID = process.env.MODERATION_LOG_CHANNEL_ID;
const warnsPath = path.join(__dirname, '..', 'data', 'warns.json');

function isStaff(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

function buildEmbed({ title, description, color = 'Red', image, footer }) {
  const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
  if (image) embed.setImage(image);
  if (footer) embed.setFooter({ text: footer });
  return embed;
}

async function tryDM(user, embed) {
  try { await user.send({ embeds: [embed] }); } catch {}
}

async function sendModLog(guild, embed) {
  const channel = guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
  if (channel) await channel.send({ embeds: [embed] });
}

function loadWarns() {
  if (!fs.existsSync(warnsPath)) return {};
  return JSON.parse(fs.readFileSync(warnsPath));
}

function saveWarns(data) {
  fs.writeFileSync(warnsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'moderation',
  async execute(message, args) {
    const cmd = args.shift()?.toLowerCase();
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    const warns = loadWarns();

    if (!cmd) return message.reply('Utilisation: `+ban|kick|mute|unmute|warn|unwarn|warns|clear|setup-ticket|help` <@user> [raison]');
    if (!isStaff(message.member) && !['warns'].includes(cmd)) return message.reply('❌ Vous n’avez pas la permission.');

    if (['ban', 'kick', 'mute', 'unmute', 'warn', 'unwarn'].includes(cmd) && !target)
      return message.reply('❌ Utilisateur non mentionné.');

    if (isStaff(target) && ['ban', 'kick', 'mute', 'warn', 'unwarn'].includes(cmd))
      return message.reply('❌ Impossible d’agir sur un autre membre staff.');

    const embedDM = buildEmbed({
      title: `🔔 ${cmd.charAt(0).toUpperCase() + cmd.slice(1)} Notification`,
      description: `Vous avez été **${cmd}** du serveur **${message.guild.name}**.\n\nRaison: ${reason}`,
      image: 'https://auto.creavite.co/api/out/DHwodsxyi3Vbsy7gn8_standard.gif',
      footer: 'Support: discord.gg/nexushop'
    });

    const embedLog = buildEmbed({
      title: `✅ ${cmd.toUpperCase()} Effectué`,
      description: `${target} a été ${cmd} par ${message.author}\n\n**Raison:** ${reason}`,
      color: 'Orange'
    });

    switch (cmd) {
      case 'ban':
        await tryDM(target.user, embedDM);
        await target.ban({ reason });
        break;
      case 'kick':
        await tryDM(target.user, embedDM);
        await target.kick(reason);
        break;
      case 'mute': {
        const duration = args[0];
        if (!duration || !/\d+[smhd]/.test(duration)) {
          return message.reply('Format: `+mute @user 10m [raison]`');
        }
        await tryDM(target.user, embedDM);
        await target.timeout(ms(duration), reason);
        break;
      }
      case 'unmute':
        await tryDM(target.user, embedDM);
        await target.timeout(null);
        break;
      case 'warn': {
        const entry = { reason, mod: message.author.tag, date: new Date().toISOString() };
        if (!warns[target.id]) warns[target.id] = [];
        warns[target.id].push(entry);
        saveWarns(warns);
        await tryDM(target.user, embedDM);
        message.channel.send(`${target} a été averti.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        break;
      }
      case 'unwarn': {
        if (!warns[target.id] || warns[target.id].length === 0) {
          return message.reply(`${target} n’a aucun avertissement.`);
        }
        warns[target.id].pop();
        saveWarns(warns);
        message.channel.send(`${target} a été un-warn.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        break;
      }
      case 'warns': {
        const user = target || message.member;
        const entries = warns[user.id] || [];
        if (entries.length === 0) {
          return message.channel.send(`${user} n’a aucun warn.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }
        const list = entries.map((w, i) => `\`#${i + 1}\` - ${w.reason} *(par ${w.mod} le <t:${Math.floor(new Date(w.date).getTime() / 1000)}>)`).join('\n');
        const embed = new EmbedBuilder()
          .setTitle(`📋 Avertissements de ${user.user.tag}`)
          .setDescription(list)
          .setColor('Orange');
        return message.channel.send({ embeds: [embed] }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
      }
      case 'clear': {
        const count = parseInt(args[0], 10);
        if (!count || count < 1 || count > 100) {
          return message.reply('Choisissez un nombre entre 1 et 100.');
        }
        await message.channel.bulkDelete(count, true);
        message.channel.send(`🧹 ${count} messages supprimés.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        embedLog.setDescription(`${message.author} a supprimé **${count}** messages.`);
        break;
      }
      case 'setup-ticket': {
        if (message.author.id !== message.guild.ownerId) {
          return message.reply('Seul le propriétaire du serveur peut utiliser cette commande.');
        }
        const setupTicket = require('../utils/sendTicketMenu');
        setupTicket(message.client);
        message.channel.send('🎫 Système de ticket initialisé.').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        break;
      }
      case 'help': {
        if (!isStaff(message.member)) return message.reply('❌ Commande réservée au staff.');
        const helpEmbed = new EmbedBuilder()
          .setTitle('📜 Commandes Modération')
          .setDescription(`
• +ban @user [raison] → Bannir un membre
• +kick @user [raison] → Expulser un membre
• +mute @user durée [raison] → Mute temporaire
• +unmute @user → Enlever le mute
• +warn @user [raison] → Ajouter un avertissement
• +unwarn @user → Enlever le dernier avertissement
• +warns [@user] → Voir les warns d’un membre
• +clear <nombre> → Supprimer X messages
• +setup-ticket → Initialiser les tickets (propriétaire uniquement)
• +help → Voir ce message
`)
          .setColor('Blue');
        return message.channel.send({ embeds: [helpEmbed] });
      }
      default:
        return message.reply('❌ Commande non reconnue.');
    }

    if ([
      'ban', 'kick', 'mute', 'unmute', 'warn', 'unwarn', 'clear'
    ].includes(cmd)) {
      await sendModLog(message.guild, embedLog);
    }

    await message.delete().catch(() => {});
  }
};
