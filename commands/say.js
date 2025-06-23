const { OWNER_ID } = process.env;

module.exports = {
  name: 'say',
  async execute(message, args) {
    if (message.author.id !== OWNER_ID) return;

    const content = args.join(' ').trim();
    const attachment = message.attachments.first();

    if (!content && !attachment) {
      return message.reply('❌ Tu dois fournir un texte ou une image.');
    }

    await message.delete().catch(() => {});

    if (attachment) {
      message.channel.send({
        content,
        files: [attachment]
      });
    } else {
      message.channel.send(content);
    }
  }
};
