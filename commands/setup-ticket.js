require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const setupTicket = require('../utils/sendTicketMenu');

module.exports = {
  name: 'setup-ticket',
  async execute(message) {
    if (message.author.id !== message.guild.ownerId) {
      await message.reply('❌ Seul le propriétaire du serveur peut utiliser cette commande.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      return;
    }

    setupTicket(message.client);

    const embed = new EmbedBuilder()
      .setTitle('🎫 Tickets configurés')
      .setDescription('Le menu des tickets a été initialisé avec succès.')
      .setColor('#ffffff');

    await message.channel.send({ embeds: [embed] }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    await message.delete().catch(() => {});
  }
};