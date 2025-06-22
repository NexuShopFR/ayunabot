require('dotenv').config();

module.exports = (message, targetUser) => {
  const staffRoleId = process.env.STAFF_ROLE_ID;

  const authorIsStaff = message.member.roles.cache.has(staffRoleId);
  const targetIsStaff = targetUser.roles.cache.has(staffRoleId);

  if (!authorIsStaff) {
    message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
    return false;
  }

  if (targetIsStaff) {
    message.reply("❌ Vous ne pouvez pas utiliser cette commande sur un autre membre du staff.");
    return false;
  }

  return true;
};
