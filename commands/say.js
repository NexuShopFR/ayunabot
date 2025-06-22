const { OWNER_ID } = process.env;

module.exports = {
  name: 'say',
  async execute(message, args) {
    if (message.author.id !== OWNER_ID) return;

    const text = args.join(' ');
    if (!text) return message.reply('❌ Tu dois fournir un texte.');

    await message.delete().catch(() => {});
    message.channel.send(text);
  }
};
