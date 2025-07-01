const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'invite',
  async execute(message, args) {
    const OWNER = process.env.OWNER_ID;
    const isOwner = message.member.roles.cache.has(OWNER);
    if (!isOwner) {
      return message.reply('❌ Commande réservée au owner.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply('❌ Mentionne un utilisateur ou donne son ID. Exemple : `+invite @user`');
    }

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
      message.reply('❌ Une erreur est survenue lors de la récupération des données.');
    }
  }
};
