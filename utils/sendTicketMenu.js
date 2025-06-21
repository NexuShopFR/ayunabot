const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

module.exports = async (client) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const ticketChannel = guild.channels.cache.get(process.env.TICKET_CHANNEL_ID);
  if (!ticketChannel) return;

  // ✅ Vérifie s'il y a déjà un menu
  const messages = await ticketChannel.messages.fetch({ limit: 10 });
  const alreadySent = messages.find(
    m => m.author.id === client.user.id && m.components.length > 0
  );
  if (alreadySent) return; // Le menu est déjà présent

  const embed = new EmbedBuilder()
    .setTitle("NexuShop Ticket System")
    .setDescription("**To open a ticket, select an option from the menu below that best fits your request.**\n\nAbuse will result in a ban.")
    .setColor("Purple")
    .setImage("https://auto.creavite.co/api/out/DHwodsxyi3Vbsy7gn8_standard.gif");

  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket-select')
    .setPlaceholder('Click to open a ticket')
    .addOptions([
      { label: 'Owner', value: 'owner', emoji: '👑', description: 'Contact the server owner.' },
      { label: 'Partnership', value: 'partner', emoji: '🤝', description: 'Open a ticket for a partnership.' },
      { label: 'Buy', value: 'buy', emoji: '💳', description: 'Open a ticket for a purchase.' },
      { label: 'Support', value: 'support', emoji: '🛠️', description: 'Open a ticket for technical support.' },
      { label: 'Cancel', value: 'cancel', emoji: '❌', description: 'Cancel the action.' },
    ]);

  const row = new ActionRowBuilder().addComponents(select);
  ticketChannel.send({ embeds: [embed], components: [row] });
};