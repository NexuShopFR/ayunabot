const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID } = process.env;

module.exports = async (interaction) => {
  const channel = interaction.channel;

  if (interaction.customId === 'claim-ticket') {
    await interaction.reply({ content: `🎟️ Ticket claim par ${interaction.user}.`, ephemeral: false });
  }

  if (interaction.customId === 'close-ticket') {
    await interaction.reply({ content: '🔒 Fermeture du ticket dans 5 secondes...', ephemeral: true });

    setTimeout(async () => {
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('🗑️ Ticket fermé')
          .setDescription(`Ticket ${channel.name} fermé par ${interaction.user.tag}`)
          .setColor('Red')
          .setTimestamp();
        logChannel.send({ embeds: [embed] });
      }

      await channel.delete().catch(() => {});
    }, 5000);
  }
};
