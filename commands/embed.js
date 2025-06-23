const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'embed',
  async execute(message, args) {
    const OWNER_ID = process.env.OWNER_ID;

    if (message.author.id !== OWNER_ID) {
      return message.reply('❌ Cette commande est réservée au propriétaire du bot.');
    }

    const content = message.content.slice(7).trim(); // Retire "+embed " du début

    if (!content) {
      return message.reply('❌ Tu dois fournir un texte pour l\'embed.');
    }

    // Détection automatique d'un lien d'image (à la fin ou dans le texte)
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const imageMatch = content.match(imageRegex);
    const imageUrl = imageMatch ? imageMatch[0] : null;

    const cleanContent = imageUrl ? content.replace(imageRegex, '').trim() : content;

    const embed = new EmbedBuilder()
      .setDescription(cleanContent)
      .setColor('#ffffff');

    if (imageUrl) embed.setImage(imageUrl);

    await message.channel.send({ embeds: [embed] });
  }
};
