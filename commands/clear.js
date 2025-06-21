module.exports = {
  name: 'clear',
  description: 'Delete a number of messages from the channel.',
  usage: '.clear <amount>',
  async execute(message, args) {
    const amount = parseInt(args[0]);
    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply("❌ You don't have permission to delete messages.");
    }

    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply(`❌ Usage: \`${this.usage}\` (1-100)`);
    }

    try {
      await message.channel.bulkDelete(amount, true);
      message.channel.send(`🧹 Deleted ${amount} messages.`).then(msg => setTimeout(() => msg.delete(), 5000));
    } catch (err) {
      message.channel.send('❌ Failed to delete messages.');
    }
  }
};