const { OWNER_ID } = process.env;

module.exports = {
  name: 'say',
  async execute(message) {
    if (message.author.id !== OWNER_ID) return;

    const content = message.content.slice('+say'.length).trim();
    const attachment = message.attachments.first();

    if (!content && !attachment) {
      return message.reply('❌ Tu dois fournir un message ou une image.');
    }

    await message.delete().catch(() => {});

    const imageUrl = content.match(/https?:\/\/\S+\.(png|jpe?g|gif|webp)/i)?.[0];
    const cleanText = imageUrl ? content.replace(imageUrl, '').trim() : content;

    message.channel.send({
      content: cleanText || null,
      files: attachment ? [attachment.url] : imageUrl ? [imageUrl] : []
    });
  }
};