const { EmbedBuilder } = require('discord.js');
const sendAvisMenu = require('../utils/sendAvisMenu');

module.exports = {
  name: 'setup-avis',
  async execute(message) {
    if (message.author.id !== message.guild.ownerId) {
      return message.reply('❌ Seul le **propriétaire du serveur** peut utiliser cette commande.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    await sendAvisMenu(message.client);

    const confirm = new EmbedBuilder()
      .setTitle('✅ Panel Avis déployé')
      .setDescription('Le panel **Avis** a été envoyé avec succès dans le salon dédié.')
      .setColor('#ffffff');

    await message.channel.send({ embeds: [confirm] }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    await message.delete().catch(() => {});
  }
};