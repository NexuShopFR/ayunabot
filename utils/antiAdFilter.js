require('dotenv').config();
const { STAFF_ROLE_ID } = process.env;

const inviteRegex = /(discord\.gg\/|discord(app)?\.com\/invite\/|invite\.gg\/|discord\.com\/invite\/)/i;

module.exports = async (message) => {
  if (!message.guild || message.author.bot) return;

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  if (isStaff) return;

  if (inviteRegex.test(message.content)) {
    try {
      // 🔥 Supprimer les messages récents avec liens d'invitation
      const messages = await message.channel.messages.fetch({ limit: 20 });
      const userMessages = messages.filter(
        m => m.author.id === message.author.id && inviteRegex.test(m.content)
      );

      await message.channel.bulkDelete(userMessages, true);

      const warnMsg = await message.channel.send(`🚫 ${message.author}, la publicité est interdite. Nouvelle tentative = sanction.`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

      try {
        await message.author.send(`🚫 Vous avez été averti pour publicité sur **${message.guild.name}**.\n\nLes invitations Discord sont interdites.`);
      } catch {}

    } catch (err) {
      console.error('Erreur anti pub :', err);
    }
  }
};
