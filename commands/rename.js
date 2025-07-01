const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'rename',
  async execute(message, args) {
    const OWNER_ID = process.env.OWNER_ID;
    const TICKET_LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID;

    const isOwner = message.author.id === OWNER_ID;
    const channel = message.channel;

    const parentName = channel.parent?.name.toLowerCase() || '';
    const isTicket = parentName.includes('ticket');
    if (!isTicket) return;
    if (!isOwner) return;

    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!newName || newName.length < 3) {
      return message.channel.send('❌ Nom invalide. Exemple : `+rename livraison`');
    }

    try {
      await channel.setName(newName);

      const confirm = await message.channel.send(`✅ Le salon a été renommé en \`${newName}\``);

      const embed = new EmbedBuilder()
        .setTitle('✏️ Ticket renommé')
        .setDescription(`Salon renommé par ${message.author} → \`${newName}\``)
        .setColor('Blue')
        .setTimestamp();

      const logChannel = message.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });

      setTimeout(() => confirm.delete().catch(() => {}), 3000);
    } catch (err) {
      console.error('Erreur lors du renommage du ticket :', err);
    }
  }
};
