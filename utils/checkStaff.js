module.exports = (message, targetUser) => {
  const staffRoleId = '1385727718192320663';

  const authorIsStaff = message.member.roles.cache.has(staffRoleId);
  const targetIsStaff = targetUser.roles.cache.has(staffRoleId);

  if (!authorIsStaff) {
    message.reply("❌ You do not have permission to use this command.");
    return false;
  }

  if (targetIsStaff) {
    message.reply("❌ You cannot use this command on another staff member.");
    return false;
  }

  return true;
};
