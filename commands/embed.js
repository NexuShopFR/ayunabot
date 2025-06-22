const { EmbedBuilder } = require('discord.js');
const { OWNER_ID } = process.env;

module.exports = {
  name: 'embed',
  async execute(message, args) {
    // Vérifie que c’est le propriétaire (toi)
    if (message.author.id !== OWNER_ID) {
      return message.reply('❌ Tu n’as pas la permission d’utiliser cette commande.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const sayMessage = args.join(' ');
    if (!sayMessage) {
      return message.reply('❌ Merci de fournir un message à envoyer.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    // Supprime ton message
    await message.delete().catch(() => {});

    // Envoie le message (en embed blanc, si tu préfères en brut je peux adapter)
    const embed = new EmbedBuilder()
      .setDescription(sayMessage)
      .setColor('#ffffff');

    message.channel.send({ embeds: [embed] });
  }
};
