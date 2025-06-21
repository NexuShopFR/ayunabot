const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const {
  STAFF_ROLE_ID,
  TICKET_LOG_CHANNEL_ID
} = process.env;

module.exports = async (interaction) => {
  const choice = interaction.values[0];

  if (choice === 'cancel') {
    return interaction.reply({ content: '❌ Action annulée.', ephemeral: true });
  }

  const ticketName = `ticket-${interaction.user.username.toLowerCase()}`;
  const existing = interaction.guild.channels.cache.find(c => c.name === ticketName);
  if (existing) {
    return interaction.reply({ content: '🟠 Vous avez déjà un ticket ouvert.', ephemeral: true });
  }

  const categoryMap = {
    partner: 'Ticket Partner',
    buy: 'Ticket Buy',
    support: 'Ticket Support',
    owner: 'Ticket Owner'
  };

  let category = interaction.guild.channels.cache.find(
    c => c.name === categoryMap[choice] && c.type === ChannelType.GuildCategory
  );
  if (!category) {
    category = await interaction.guild.channels.create({
      name: categoryMap[choice],
      type: ChannelType.GuildCategory
    });
  }

  // 👮 Permissions
  const permissionOverwrites = [
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
  ];

  if (choice === 'owner') {
    permissionOverwrites.push({
      id: interaction.guild.ownerId,
      allow: [PermissionsBitField.Flags.ViewChannel]
    });
  } else {
    permissionOverwrites.push({
      id: STAFF_ROLE_ID,
      allow: [PermissionsBitField.Flags.ViewChannel]
    });
  }

  // 📦 Créer le salon
  const channel = await interaction.guild.channels.create({
    name: ticketName,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites
  });

  // 📩 Message dans le ticket
  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket Ouvert")
    .setDescription(`Merci ${interaction.user}, un membre de notre équipe vous répondra bientôt.`)
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

  const mention = `<@&${STAFF_ROLE_ID}>`;

  await channel.send({
    content: mention,
    embeds: [embed],
    components: [buttons]
  });

  await interaction.reply({ content: `🎫 Votre ticket a été ouvert ici : ${channel}`, ephemeral: true });

  // 🧾 Log dans le salon des logs des tickets
  const logChannel = interaction.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setTitle("📥 Nouveau Ticket Ouvert")
      .setDescription(`**Salon** : ${channel}\n**Utilisateur** : ${interaction.user.tag} (${interaction.user.id})\n**Type** : ${choice}`)
      .setColor("Blue")
      .setTimestamp();

    logChannel.send({ embeds: [logEmbed] });
  }
};