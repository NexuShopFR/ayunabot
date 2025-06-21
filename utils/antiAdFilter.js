const { STAFF_ROLE_ID } = process.env;

// Expressions régulières typiques des liens d’invitation
const inviteRegex = /(discord\.gg\/|discordapp\.com\/invite\/|invite\.gg\/)/i;

module.exports = (message) => {
  if (!message.guild || message.author.bot) return;

  const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);
  if (isStaff) return;

  if (inviteRegex.test(message.content)) {
    message.delete().catch(() => {});
    message.channel.send(`🚫 ${message.author}, la publicité est interdite.`).then(msg => {
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    });
  }
};
