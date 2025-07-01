require('dotenv').config();
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
    .setTitle("🎫 Ayuna Ticket System")
    .setDescription("**Sélectionne un type de ticket ci-dessous.**\nTout abus sera sanctionné.")
    .setColor("White")
    .setImage("https://i.imgur.com/iaLkMmW.gif");

  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket-select')
    .setPlaceholder('📩 Choisis un type de ticket')
    .addOptions([
      { label: '👑 Buy Owner', value: 'owner', description: 'Contacter le propriétaire pour un achat' },
      { label: '💼 Buy Seller', value: 'seller', description: 'Contacter un vendeur du shop' },
      { label: '🤝 Partnership', value: 'partner', description: 'Demander un partenariat' },
      { label: '🛠️ Support', value: 'support', description: 'Demander de l’aide' },
      { label: '❌ Annuler', value: 'cancel', description: 'Annuler la création de ticket' }
    ]);

  const row = new ActionRowBuilder().addComponents(select);
  await ticketChannel.send({ embeds: [embed], components: [row] });
};
