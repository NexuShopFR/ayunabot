const { EmbedBuilder } = require('discord.js');
const { OWNER_ID } = process.env;

module.exports = {
  name: 'embed',
  async execute(message, args) {
    if (message.author.id !== OWNER_ID) return;

    const content = args.join(' ').trim();
    if (!content && message.attachments.size === 0) {
      return message.reply('❌ Tu dois fournir un texte ou une image.');
    }

    const embed = new EmbedBuilder()
      .setDescription(content || null)
      .setColor('White');

    // ✅ Si une image est jointe
    const attachment = message.attachments.first();
    if (attachment && attachment.contentType?.startsWith('image/')) {
      embed.setImage(attachment.url);
    }

    // ✅ Si une URL d’image est incluse dans le message
    const imageUrlMatch = content?.match(/https?:\/\/\S+\.(png|jpg|jpeg|gif|webp)/i);
    if (imageUrlMatch) {
      embed.setImage(imageUrlMatch[0]);
    }

    await message.delete().catch(() => {});
    message.channel.send({ embeds: [embed] });
  }
};
