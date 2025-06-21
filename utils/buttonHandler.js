const { LOG_CHANNEL_ID } = process.env;

module.exports = async (interaction) => {
  const channel = interaction.channel;

  if (interaction.customId === 'claim-ticket') {
    await interaction.reply({ content: `Ticket claimed by ${interaction.user}.`, ephemeral: false });
  }

  if (interaction.customId === 'close-ticket') {
    await interaction.reply({ content: 'Closing ticket in 5 seconds...', ephemeral: true });

    setTimeout(async () => {
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        logChannel.send(`🗑️ Ticket ${channel.name} was closed by ${interaction.user.tag}`);
      }
      await channel.delete().catch(() => {});
    }, 5000);
  }
};