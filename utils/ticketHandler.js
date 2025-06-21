const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = async (interaction) => {
  const choice = interaction.values[0];
  if (choice === 'cancel') {
    return interaction.reply({ content: 'Action cancelled.', ephemeral: true });
  }

  const ticketName = `ticket-${interaction.user.username.toLowerCase()}`;
  const existing = interaction.guild.channels.cache.find(c => c.name === ticketName);
  if (existing) return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });

  const categoryMap = {
    owner: 'Ticket Owner',
    partner: 'Ticket Partner',
    buy: 'Ticket Buy',
    support: 'Ticket Support'
  };

  let category = interaction.guild.channels.cache.find(c => c.name === categoryMap[choice] && c.type === ChannelType.GuildCategory);
  if (!category) {
    category = await interaction.guild.channels.create({
      name: categoryMap[choice],
      type: ChannelType.GuildCategory
    });
  }

  const roleMention = {
    owner: '@Owner',
    partner: '@Staff',
    buy: '@Seller',
    support: '@Support'
  };

  const channel = await interaction.guild.channels.create({
    name: ticketName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      }
    ]
  });

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket Created")
    .setDescription(`Thank you ${interaction.user}, our team will respond shortly.`)
    .setColor("Green");

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('claim-ticket')
      .setLabel('Claim Ticket')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('Close Ticket')
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: `${roleMention[choice]}`,
    embeds: [embed],
    components: [buttons]
  });

  interaction.reply({ content: `Your ticket has been opened: ${channel}`, ephemeral: true });
};