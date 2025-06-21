module.exports = {
  name: 'mute',
  description: 'Temporarily mute a user using timeout.',
  usage: '.mute <@user> <duration>',
  async execute(message, args) {
    const member = message.mentions.members.first();
    const duration = args[1];

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply("❌ You don't have permission to mute members.");
    }

    if (!member || !duration) {
      return message.reply(`❌ Usage: \`${this.usage}\``);
    }

    const ms = require('ms');
    const time = ms(duration);
    if (!time) return message.reply('❌ Invalid duration. Use format like `10m`, `1h`, etc.');

    try {
      await member.timeout(time, `Muted by ${message.author.tag}`);
      message.channel.send(`🔇 ${member.user.tag} has been muted for ${duration}.`);
    } catch {
      message.channel.send('❌ Failed to mute member.');
    }
  }
};