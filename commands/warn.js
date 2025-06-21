module.exports = {
  name: 'warn',
  description: 'Warn a user and log the reason.',
  usage: '.warn <@user> <reason>',
  async execute(message, args) {
    const member = message.mentions.members.first();
    const reason = args.slice(1).join(' ');

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply("❌ You don't have permission to warn members.");
    }

    if (!member || !reason) {
      return message.reply(`❌ Usage: \`${this.usage}\``);
    }

    try {
      await member.send(`⚠️ You have been warned in **${message.guild.name}**: ${reason}`).catch(() => {});
      message.channel.send(`⚠️ ${member.user.tag} has been warned. Reason: ${reason}`);
    } catch {
      message.channel.send('❌ Failed to warn member.');
    }
  }
};