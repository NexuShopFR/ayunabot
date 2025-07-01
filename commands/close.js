const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'close',
  async execute(message) {
    const channel = message.channel;
    const OWNER_ID = process.env.OWNER_ID;
    const TICKET_LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID;

    const isOwner = message.author.id === OWNER_ID;
    if (!isOwner) return;

    const parentName = channel.parent?.name.toLowerCase() || '';
    const isTicket = parentName.includes('ticket');

    if (!isTicket) return;

    const embed = new EmbedBuilder()
      .setTitle('🎟️ Ticket Fermé')
      .setDescription(`Le ticket **${channel.name}** a été fermé par ${message.author}`)
      .setColor('Red')
      .setTimestamp();

    const logChannel = message.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [embed] });

    await channel.send('✅ Fermeture dans 3 secondes...');
    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 3000);
  }
};
