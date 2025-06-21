const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

const { TICKET_CHANNEL_ID } = process.env;

module.exports = {
  name: 'setup-ticket',
  async execute(message) {
    // Permissions check
    if (!message.member.permissions.has('Administrator')) {
      return message.reply("❌ You don't have permission to use this command.");
    }

    const channel = message.guild.channels.cache.get(TICKET_CHANNEL_ID);
    if (!channel) {
      return message.reply("❌ Ticket channel not found. Check TICKET_CHANNEL_ID in .env");
    }

    // Check if a menu already exists
    const messages = await channel.messages.fetch({ limit: 10 });
    const alreadySent = messages.find(m => m.author.id === message.client.user.id && m.components.length > 0);
    if (alreadySent) {
      return message.reply("⚠️ The ticket menu already exists in that channel.");
    }

    const embed = new EmbedBuilder()
      .setTitle("NexuShop Ticket System")
      .setDescription("**To open a ticket, select an option from the menu below that best fits your request.**\n\nAbuse will result in a ban.")
      .setColor("Purple")
      .setImage("https://auto.creavite.co/api/out/DHwodsxyi3Vbsy7gn8_standard.gif");

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket-select')
      .setPlaceholder('Click to open a ticket')
      .addOptions([
        { label: 'Owner', description: 'Contact the server owner.', emoji: '👑', value: 'owner' },
        { label: 'Partnership', description: 'Open a ticket for a partnership.', emoji: '🤝', value: 'partner' },
        { label: 'Buy', description: 'Open a ticket for a purchase.', emoji: '💳', value: 'buy' },
        { label: 'Support', description: 'Open a ticket for technical support.', emoji: '🛠️', value: 'support' },
        { label: 'Cancel', description: 'Cancel the action.', emoji: '❌', value: 'cancel' }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    await channel.send({ embeds: [embed], components: [row] });
    message.reply("✅ Ticket menu has been sent to the ticket channel.");
  }
};