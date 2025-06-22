const { Collection } = require('discord.js');
const { STAFF_ROLE_ID } = process.env;

// Paramètres anti-spam
const spamLimit = 5;       // nombre de messages max
const interval = 7000;     // durée en ms (7s)
const warnCooldown = 15000; // délai avant un nouveau warn possible

const userMessages = new Collection();
const lastWarned = new Collection();

module.exports = async (message) => {
  if (!message.guild || message.author.bot) return;

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  if (isStaff) return;

  const now = Date.now();
  const userId = message.author.id;
  const channel = message.channel;

  // Ajoute le message à l’historique
  if (!userMessages.has(userId)) {
    userMessages.set(userId, []);
  }
  const timestamps = userMessages.get(userId);
  timestamps.push(now);

  // Garde uniquement les messages récents (dans l'intervalle)
  const recent = timestamps.filter(ts => now - ts < interval);
  userMessages.set(userId, recent);

  if (recent.length >= spamLimit) {
    if (lastWarned.get(userId) && now - lastWarned.get(userId) < warnCooldown) return;

    lastWarned.set(userId, now);

    try {
      const messages = await channel.messages.fetch({ limit: 30 });
      const userMsgs = messages.filter(m => m.author.id === userId);
      await channel.bulkDelete(userMsgs, true);

      const warnMsg = await channel.send(`⚠️ ${message.author}, merci d'éviter le spam.`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 4000);

      try {
        await message.author.send(`⚠️ Vous avez été averti pour spam dans **${message.guild.name}**.`);
      } catch {}

    } catch (err) {
      console.error("Erreur anti-spam :", err);
    }
  }
};
