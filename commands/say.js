require('dotenv').config();

module.exports = {
  name: 'say',
  async execute(message) {
    const OWNER_ID = process.env.OWNER_ID;

    if (message.author.id !== OWNER_ID) {
      return message.reply('❌ Cette commande est réservée au propriétaire du bot.');
    }

    const content = message.content.slice(5).trim(); // Retire "+say " du début

    if (!content) {
      return message.reply('❌ Tu dois fournir un texte.');
    }

    await message.delete().catch(() => {});
    await message.channel.send({ content });
  }
};
