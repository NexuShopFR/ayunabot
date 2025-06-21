module.exports = {
  name: 'kick',
  description: 'Kick a user from the server.',
  usage: '.kick <@user> [reason]',
  async execute(message, args) {
    const member = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!message.member.permissions.has('KickMembers')) {
      return message.reply("❌ You don't have permission to kick members.");
    }

    if (!member) {
      return message.reply(`❌ Usage: \`${this.usage}\``);
    }

    try {
      await member.kick(reason);
      message.channel.send(`👢 ${member.user.tag} has been kicked. Reason: ${reason}`);
    } catch (err) {
      message.channel.send('❌ Failed to kick member.');
    }
  }
};