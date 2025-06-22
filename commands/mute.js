require('dotenv').config(); // ← AJOUTER ÇA
const { EmbedBuilder } = require('discord.js');
const ms = require('ms');
const { STAFF_ROLE_ID, MODERATION_LOG_CHANNEL_ID } = process.env;

module.exports = {
  name: 'mute',
  async execute(message, args) {
    const target = message.mentions.members.first();
    const duration = args[1];
    const reason = args.slice(2).join(' ') || 'Aucune raison fournie';
    if (!message.member.roles.cache.has(STAFF_ROLE_ID)) return message.reply('❌ Staff uniquement.');
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    if (!duration || !/\d+[smhd]/.test(duration)) return message.reply('Format: `+mute @user 10m [raison]`');
    if (target.roles.cache.has(STAFF_ROLE_ID)) return message.reply('❌ Impossible sur un autre staff.');

    const embed = new EmbedBuilder()
      .setTitle('🔇 Muté')
      .setDescription(`${target} a été muté pour ${duration} par ${message.author}
Raison: ${reason}`)
      .setColor('#ffffff')
      .setImage('https://auto.creavite.co/api/out/Yojdi6y2Kbbnsy9trz_standard.gif')
      .setFooter({ text: 'discord.gg/nexushop' });

    await target.send({ embeds: [embed] }).catch(() => {});
    await target.timeout(ms(duration), reason);
    const logChannel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [embed] });
    await message.delete().catch(() => {});
  }
};