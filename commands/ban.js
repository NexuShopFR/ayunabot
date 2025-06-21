module.exports = {
  name: 'ban',
  description: 'Ban a user from the server.',
  usage: '.ban <@user> [reason]',
  async execute(message, args) {
    const member = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!message.member.permissions.has('BanMembers')) {
      return message.reply("❌ You don't have permission to ban members.");
    }

    if (!member) {
      return message.reply(`❌ Usage: \`${this.usage}\``);
    }

    try {
      await member.ban({ reason });
      message.channel.send(`✅ ${member.user.tag} has been banned. Reason: ${reason}`);
    } catch (err) {
      message.channel.send('❌ Failed to ban member.');
    }
  }
};