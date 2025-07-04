const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'kick',
  async execute(message, args) {
    const { OWNER_ID, MODERATION_LOG_CHANNEL_ID } = process.env;
    if (!message.member.roles.cache.has(OWNER_ID)) return message.reply('❌ Owner uniquement.');

    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    if (target.roles.cache.has(OWNER_ID)) return message.reply('❌ Impossible sur un autre owner.');

    const embed = new EmbedBuilder()
      .setTitle('🥾 Expulsé')
      .setDescription(`${target} a été expulsé par ${message.author}\nRaison : ${reason}`)
      .setColor('#ffffff')
      .setImage('https://i.imgur.com/iaLkMmW.gif')
      .setFooter({ text: 'discord.gg/ayunashop' });

    await target.send({ embeds: [embed] }).catch(() => {});
    await target.kick(reason);

    const logChannel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [embed] });

    await message.delete().catch(() => {});
  }
};