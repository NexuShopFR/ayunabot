const { EmbedBuilder, ChannelType } = require('discord.js');
const { LOG_CHANNEL_ID } = process.env;

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const channel = interaction.channel;
  const user = interaction.user;

  if (interaction.customId === 'claim-ticket') {
    await interaction.reply({
      content: `🎟️ Ticket claim par ${user}.`,
      ephemeral: false
    });
    return;
  }

  if (interaction.customId === 'close-ticket') {
    await interaction.reply({
      content: '🔒 Fermeture du ticket dans 5 secondes...',
      ephemeral: true
    });

    setTimeout(async () => {
      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('🗑️ Ticket Fermé')
          .setDescription(`Le ticket **${channel.name}** a été fermé par ${user.tag}`)
          .setColor('Red')
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }

      if (channel.type === ChannelType.GuildText && channel.deletable) {
        await channel.delete().catch(() => {});
      }
    }, 5000);
  }
};
