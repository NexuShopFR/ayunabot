client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  const content = message.content.trim();
  const args = content.split(/ +/);
  const cmd = args.shift().toLowerCase();

  const { EmbedBuilder } = require('discord.js');
  const isStaff = message.member.roles.cache.has(process.env.STAFF_ROLE_ID);
  const ticketLogChannel = message.guild.channels.cache.get(process.env.TICKET_LOG_CHANNEL_ID);

  // 💬 Commandes classiques (préfixe ".")
  if (content.startsWith('.')) {
    const commandName = cmd.slice(1);
    const command = client.commands.get(commandName);
    if (command) {
      try {
        await command.execute(message, args);
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue lors de l’exécution de la commande.');
      }
    }
    return;
  }

  // 🎫 Commandes dans les salons de ticket
  if (!message.channel.name?.startsWith('ticket-')) return;

  const ticketOwner = message.channel.name.replace('ticket-', '');
  const isTicketOwner = ticketOwner === message.author.username.toLowerCase();
  if (!isStaff && !isTicketOwner) return;

  // ➕ Fermer un ticket
  if (cmd === '+close') {
    const embed = new EmbedBuilder()
      .setTitle('🎟️ Ticket Fermé')
      .setDescription(`Le ticket **${message.channel.name}** a été fermé par ${message.author}.`)
      .setColor('Red')
      .setTimestamp();

    if (ticketLogChannel) await ticketLogChannel.send({ embeds: [embed] });

    await message.channel.send('✅ Fermeture du ticket dans 3 secondes...');
    setTimeout(() => message.channel.delete().catch(() => {}), 3000);
    return;
  }

  // ➕ Renommer un ticket
  if (cmd === '+rename') {
    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9\-]/g, '');
    if (!newName || newName.length < 3) {
      return message.reply('❌ Donnez un nom valide. Exemple : `+rename livraison-pb`');
    }

    await message.channel.setName(`ticket-${newName}`);
    await message.reply(`✅ Nom du ticket mis à jour en \`ticket-${newName}\``);

    const embed = new EmbedBuilder()
      .setTitle('✏️ Ticket renommé')
      .setDescription(`Ticket renommé par ${message.author} → \`ticket-${newName}\``)
      .setColor('Blue')
      .setTimestamp();

    if (ticketLogChannel) await ticketLogChannel.send({ embeds: [embed] });
    return;
  }
});