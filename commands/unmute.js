module.exports = {
  name: 'unmute',
  description: 'Remove timeout from a user.',
  usage: '.unmute <@user>',
  async execute(message, args) {
    const member = message.mentions.members.first();

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply("❌ You don't have permission to unmute members.");
    }

    if (!member) {
      return message.reply(`❌ Usage: \`${this.usage}\``);
    }

    try {
      await member.timeout(null);
      message.channel.send(`🔊 ${member.user.tag} has been unmuted.`);
    } catch {
      message.channel.send('❌ Failed to unmute member.');
    }
  }
};