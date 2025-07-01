require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID;
const MODERATION_LOG_CHANNEL_ID = process.env.MODERATION_LOG_CHANNEL_ID;

module.exports = {
  name: 'clear',
  async execute(message, args) {
    if (!message.member.roles.cache.has(OWNER_ID)) return message.reply('❌ Commande réservée au owner.');

    const count = parseInt(args[0], 10);
    if (!count || count < 1 || count > 100) {
      return message.reply('Choisissez un nombre entre 1 et 100.');
    }

    await message.channel.bulkDelete(count, true);
    await message.channel.send(`🧹 ${count} messages supprimés.`)
      .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

    const embed = new EmbedBuilder()
      .setTitle('🧹 CLEAR Effectué')
      .setDescription(`${message.author} a supprimé **${count}** messages dans ${message.channel}.`)
      .setColor('Orange');

    const logChannel = message.guild.channels.cache.get(MODERATION_LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [embed] });

    await message.delete().catch(() => {});
  }
};
