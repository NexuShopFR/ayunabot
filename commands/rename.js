const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rename',
  async execute(message, args) {
    if (!message.channel.name?.startsWith('ticket-')) return;

    const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;
    const TICKET_LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL_ID;

    const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
    const ticketOwner = message.channel.name.replace('ticket-', '');
    const isTicketOwner = ticketOwner === message.author.username.toLowerCase();

    if (!isStaff && !isTicketOwner) return;

    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!newName || newName.length < 3) {
      const reply = await message.reply('❌ Nom invalide. Exemple : `+rename livraison`');
      await message.delete().catch(() => {});
      return;
    }

    try {
      await message.channel.setName(newName);

      const confirm = await message.reply(`✅ Salon renommé : \`${newName}\``);

      const embed = new EmbedBuilder()
        .setTitle('✏️ Ticket renommé')
        .setDescription(`Salon renommé par ${message.author} → \`${newName}\``)
        .setColor('Blue')
        .setTimestamp();

      const logChannel = message.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });

      setTimeout(() => {
        confirm.delete().catch(() => {});
      }, 3000);
    } catch (err) {
      console.error(err);
      await message.reply('❌ Impossible de renommer ce salon.');
    }

    await message.delete().catch(() => {});
  }
};
