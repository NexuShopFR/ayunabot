const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'invite',
  async execute(message, args) {
    const isOwner = message.author.id === process.env.OWNER_ID;
    if (!isOwner) return message.reply('❌ Commande réservée au Owner.');

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.reply('❌ Mentionne un utilisateur ou donne son ID.');

    try {
      const invites = await message.guild.invites.fetch();
      const userInvites = invites.filter(inv => inv.inviter?.id === member.id);
      const totalInvites = userInvites.size;
      const totalUses = userInvites.reduce((acc, inv) => acc + (inv.uses || 0), 0);

      const embed = new EmbedBuilder()
        .setTitle(`📨 Invitations de ${member.user.tag}`)
        .addFields(
          { name: '🔢 Total de liens créés', value: `${totalInvites}`, inline: true },
          { name: '✅ Utilisations valides', value: `${totalUses}`, inline: true },
          { name: '❌ Non utilisées ou expirées', value: `${totalInvites - totalUses}`, inline: true }
        )
        .setColor('#ffffff')
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Erreur lors de la récupération des données.');
    }
  }
};