require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const { OWNER_ID, MODERATION_LOG_CHANNEL_ID } = process.env;

module.exports = {
  name: 'ban',
  async execute(message, args) {
    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

    if (!message.member.roles.cache.has(OWNER_ID)) return message.reply('❌ Owner uniquement.');
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    if (target.roles.cache.has(OWNER_ID)) return message.reply('❌ Impossible sur un autre owner.');

    const embed = new EmbedBuilder()
      .setTitle('🔨 Banni')
      .setDescription(`${target} a été **banni** par ${message.author}\nRaison : ${reason}`)
      .setColor('#ffffff')
      .setImage('https://i.imgur.com/iaLkMmW.gif')
      .setFooter({ text: 'discord.gg/ayunashop' });

    try { await target.send({ embeds: [embed] }); } catch {}
    await target.ban({ reason });

    const logChannel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [embed] });

    await message.delete().catch(() => {});
  }
};