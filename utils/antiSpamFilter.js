require('dotenv').config();
const { Collection } = require('discord.js');
const { STAFF_ROLE_ID } = process.env;

const spamLimit = 5;
const interval = 7000;
const warnCooldown = 15000;

const userMessages = new Collection();
const lastWarned = new Collection();

module.exports = async (message) => {
  if (!message.guild || message.author.bot) return;

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  if (isStaff) return;

  const now = Date.now();
  const userId = message.author.id;

  if (!userMessages.has(userId)) userMessages.set(userId, []);
  const timestamps = userMessages.get(userId);
  timestamps.push(now);

  // Nettoyage des anciens messages
  const recent = timestamps.filter(ts => now - ts < interval);
  userMessages.set(userId, recent);

  if (recent.length >= spamLimit) {
    if (lastWarned.has(userId) && now - lastWarned.get(userId) < warnCooldown) return;
    lastWarned.set(userId, now);

    try {
      const messages = await message.channel.messages.fetch({ limit: 30 });
      const userMsgs = messages.filter(m => m.author.id === userId);
      await message.channel.bulkDelete(userMsgs, true);

      const warnMsg = await message.channel.send(`⚠️ ${message.author}, merci d'éviter le spam.`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 4000);

      try {
        await message.author.send(`⚠️ Vous avez été averti pour spam dans **${message.guild.name}**.`);
      } catch {}

    } catch (err) {
      console.error("Erreur anti-spam :", err);
    }
  }
};
