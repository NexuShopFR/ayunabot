require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const OWNER_ID = process.env.OWNER_ID;
const MODERATION_LOG_CHANNEL_ID = process.env.MODERATION_LOG_CHANNEL_ID;
const warnsPath = path.join(__dirname, '..', 'data', 'warns.json');

module.exports = {
  name: 'warn',
  async execute(message, args) {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    if (!message.member.roles.cache.has(OWNER_ID)) return message.reply('❌ Commande réservée au Owner.');
    if (!target) return message.reply('❌ Utilisateur non mentionné.');
    if (target.roles.cache.has(OWNER_ID)) return message.reply('❌ Impossible d’avertir un autre owner.');

    const warns = fs.existsSync(warnsPath) ? JSON.parse(fs.readFileSync(warnsPath)) : {};
    const entry = { reason, mod: message.author.tag, date: new Date().toISOString() };
    if (!warns[target.id]) warns[target.id] = [];
    warns[target.id].push(entry);
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('📢 Warn Notification')
      .setDescription(`Vous avez été **warn** sur **${message.guild.name}**.\n\nRaison : ${reason}`)
      .setImage('https://i.imgur.com/iaLkMmW.gif')
      .setFooter({ text: 'Support: discord.gg/ayunashop' })
      .setColor('#ffffff');

    try { await target.user.send({ embeds: [embed] }); } catch {}

    const logEmbed = new EmbedBuilder()
      .setTitle('✅ WARN Effectué')
      .setDescription(`${target} a été warn par ${message.author}\n**Raison :** ${reason}`)
      .setColor('Orange');

    const logChannel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [logEmbed] });

    await message.channel.send(`${target} a été averti.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    await message.delete().catch(() => {});
  }
};
