require('dotenv').config();
const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const {
  TICKET_LOG_CHANNEL_ID
} = process.env;

module.exports = async (interaction) => {
  const choice = interaction.values[0];
  if (choice === 'cancel') {
    return interaction.reply({ content: '❌ Ticket annulé.', ephemeral: true });
  }

  const username = interaction.user.username.toLowerCase().replace(/[^a-z0-9\-]/g, '');
  const existing = interaction.guild.channels.cache.find(c => c.name === username);
  if (existing) {
    return interaction.reply({ content: '⚠️ Vous avez déjà un ticket ouvert.', ephemeral: true });
  }

  const categoryMap = {
    partner: 'Ticket Partner',
    support: 'Ticket Support',
    owner: 'Ticket Buy Owner',
    seller: 'Ticket Buy Seller'
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
    },
    {
      id: interaction.guild.ownerId,
      allow: [PermissionsBitField.Flags.ViewChannel]
    }
  ];

  const channel = await interaction.guild.channels.create({
    name: username,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites
  });

  const embed = new EmbedBuilder()
    .setTitle("📨 Ticket Ouvert")
    .setDescription(`Bonjour ${interaction.user}, le propriétaire vous répondra bientôt.`)
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
    content: `<@${interaction.guild.ownerId}>`,
    embeds: [embed],
    components: [buttons]
  });

  await interaction.reply({ content: `🎫 Ticket créé ici : ${channel}`, ephemeral: true });

  const logChannel = interaction.guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setTitle("🧾 Nouveau Ticket")
      .setDescription(`**Salon** : ${channel}\n**Utilisateur** : ${interaction.user.tag}\n**Type** : ${choice}`)
      .setColor("Blue")
      .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] });
  }
};
