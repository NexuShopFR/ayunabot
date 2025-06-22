const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

module.exports = async (client) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const ticketChannel = guild.channels.cache.get(process.env.TICKET_CHANNEL_ID);
  if (!ticketChannel) return;

  const messages = await ticketChannel.messages.fetch({ limit: 10 });
  const alreadySent = messages.find(
    m => m.author.id === client.user.id && m.components.length > 0
  );
  if (alreadySent) return;

  const embed = new EmbedBuilder()
    .setTitle("🎫 NexuShop Ticket System")
    .setDescription("**Sélectionne un type de ticket ci-dessous.**\nTout abus sera sanctionné.")
    .setColor("White")
    .setImage("https://auto.creavite.co/api/out/DHwodsxyi3Vbsy7gn8_standard.gif");

  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket-select')
    .setPlaceholder('📩 Choisis un type de ticket')
    .addOptions([
      { label: '👑 Owner', value: 'owner', description: 'Contacter le propriétaire du serveur' },
      { label: '🤝 Partnership', value: 'partner', description: 'Demander un partenariat' },
      { label: '💳 Buy', value: 'buy', description: 'Faire un achat' },
      { label: '🛠️ Support', value: 'support', description: 'Demander de l’aide' },
      { label: '🎁 Reward Invites', value: 'reward', description: 'Réclamer une récompense d’invitations' },
      { label: '❌ Annuler', value: 'cancel', description: 'Annuler la création de ticket' },
    ]);

  const row = new ActionRowBuilder().addComponents(select);
  await ticketChannel.send({ embeds: [embed], components: [row] });
};
