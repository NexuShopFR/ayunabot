const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'mute',
  async execute(message, args) {
    const { OWNER_ID, MODERATION_LOG_CHANNEL_ID } = process.env;
    if (!message.member.roles.cache.has(OWNER_ID)) return message.reply('❌ Owner uniquement.');

    const target = message.mentions.members.first();
    const durationStr = args[1];
    if (!target || !durationStr) return message.reply('❌ Utilisation: +mute @user 10m');
    if (target.roles.cache.has(OWNER_ID)) return message.reply('❌ Pas possible sur un autre owner.');

    const durationMs = require('ms')(durationStr);
    if (!durationMs || durationMs < 1000) return message.reply('⏱️ Durée invalide.');

    const embed = new EmbedBuilder()
      .setTitle('🔇 Mute Notification')
      .setDescription(`Vous avez été **mute** sur **${message.guild.name}** pendant ${durationStr}.`)
      .setImage('https://i.imgur.com/iaLkMmW.gif')
      .setFooter({ text: 'Support: discord.gg/ayunashop' })
      .setColor('#ffffff');

    try {
      await target.timeout(durationMs);
      await target.user.send({ embeds: [embed] }).catch(() => {});
    } catch (e) {
      return message.reply('❌ Erreur pendant le mute.');
    }

    const log = new EmbedBuilder()
      .setTitle('🔇 MUTE Effectué')
      .setDescription(`${target} a été mute par ${message.author} pendant ${durationStr}`)
      .setColor('Orange');

    const logChannel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [log] });

    await message.delete().catch(() => {});
  }
};