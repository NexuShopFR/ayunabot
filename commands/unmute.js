require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID;
const MODERATION_LOG_CHANNEL_ID = process.env.MODERATION_LOG_CHANNEL_ID;

module.exports = {
  name: 'unmute',
  async execute(message) {
    const target = message.mentions.members.first();
    if (!message.member.roles.cache.has(OWNER_ID)) return message.reply('❌ Commande réservée au Owner.');
    if (!target) return message.reply('❌ Utilisateur non mentionné.');
    if (target.roles.cache.has(OWNER_ID)) return message.reply('❌ Impossible d’agir sur un autre owner.');

    const embed = new EmbedBuilder()
      .setTitle('🔊 Unmute Notification')
      .setDescription(`Vous avez été **unmute** du serveur **${message.guild.name}**.`)
      .setImage('https://i.imgur.com/iaLkMmW.gif')
      .setFooter({ text: 'Support: discord.gg/ayunashop' })
      .setColor('#ffffff');

    try {
      await target.user.send({ embeds: [embed] });
    } catch {}

    try {
      await target.timeout(null);
    } catch (e) {
      return message.reply('❌ Erreur lors du unmute.').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    const logEmbed = new EmbedBuilder()
      .setTitle('✅ UNMUTE Effectué')
      .setDescription(`${target} a été unmute par ${message.author}`)
      .setColor('Orange');

    const logChannel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [logEmbed] });

    await message.delete().catch(() => {});
  }
};