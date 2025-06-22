const { STAFF_ROLE_ID } = process.env;

const inviteRegex = /(discord\.gg\/|discordapp\.com\/invite\/|invite\.gg\/)/i;

module.exports = async (message) => {
  if (!message.guild || message.author.bot) return;

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  if (isStaff) return;

  if (inviteRegex.test(message.content)) {
    try {
      // 🔥 Supprimer tous les messages récents de l’utilisateur contenant un lien
      const messages = await message.channel.messages.fetch({ limit: 20 });
      const userMessages = messages.filter(
        m => m.author.id === message.author.id && inviteRegex.test(m.content)
      );

      await message.channel.bulkDelete(userMessages, true);

      // ⚠️ Message d’avertissement
      const warnMsg = await message.channel.send(`🚫 ${message.author}, la publicité est interdite. Nouvelle tentative = sanction.`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

      // 🔔 Optionnel : DM à l’utilisateur
      try {
        await message.author.send(`🚫 Vous avez été averti pour publicité sur **${message.guild.name}**.\n\nLes invitations Discord sont interdites.`);
      } catch {}
      
    } catch (err) {
      console.error('Erreur anti pub:', err);
    }
  }
};
