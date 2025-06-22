const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'close',
  async execute(message) {
    if (!message.channel.name?.startsWith('ticket-')) return;

    const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
    const TICKET_LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID;

    const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
    const ticketOwner = message.channel.name.replace('ticket-', '');
    const isTicketOwner = ticketOwner === message.author.username.toLowerCase();

    if (!isStaff && !isTicketOwner) return;

    const embed = new EmbedBuilder()
      .setTitle('🎟️ Ticket Fermé')
      .setDescription(`Le ticket **${message.channel.name}** a été fermé par ${message.author}`)
      .setColor('Red')
      .setTimestamp();

    const logChannel = message.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
    if (logChannel) logChannel.send({ embeds: [embed] });

    await message.reply('✅ Fermeture dans 3 secondes...');
    setTimeout(() => {
      message.channel.delete().catch(() => {});
    }, 3000);

    await message.delete().catch(() => {});
  }
};
