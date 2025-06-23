const { EmbedBuilder } = require('discord.js');
const { OWNER_ID } = process.env;

module.exports = {
  name: 'embed',
  async execute(message) {
    if (message.author.id !== OWNER_ID) return;

    const content = message.content.slice('+embed'.length).trim();
    const attachment = message.attachments.first();

    if (!content && !attachment) {
      return message.reply('❌ Tu dois fournir un message ou une image.');
    }

    await message.delete().catch(() => {});

    const imageUrl = content.match(/https?:\/\/\S+\.(png|jpe?g|gif|webp)/i)?.[0];
    const cleanText = imageUrl ? content.replace(imageUrl, '').trim() : content;

    const embed = new EmbedBuilder()
      .setDescription(cleanText || null)
      .setColor('#2b2d31'); // Couleur sobre

    if (attachment) embed.setImage(attachment.url);
    else if (imageUrl) embed.setImage(imageUrl);

    message.channel.send({ embeds: [embed], allowedMentions: { parse: ['users', 'roles', 'everyone'] } });
  }
};
