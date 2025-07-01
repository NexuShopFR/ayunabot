const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Commandes disponibles')
      .setColor('#ffffff')
      .setDescription(`**🎟️ Tickets**
\`+rename <nom>\` - Renommer un ticket
\`+close\` - Fermer un ticket

**🛠️ Modération**
\`+warn @user <raison>\` - Avertir un membre
\`+unwarn @user\` - Retirer un avertissement
\`+warns @user\` - Voir les avertissements
\`+kick @user <raison>\` - Expulser un membre
\`+ban @user <raison>\` - Bannir un membre
\`+mute @user <durée>\` - Rendre muet temporairement
\`+unmute @user\` - Enlever le mute
\`+clear <nombre>\` - Supprimer des messages

**👑 Bot**
\`+embed <texte>\` - Envoyer un embed personnalisé
\`+say <texte>\` - Faire parler le bot
\`+setup-ticket\` - Configuration du système de tickets

**📦 Divers**
\`+invite @user\` - Voir les invitations d’un membre`);

    await message.channel.send({ embeds: [embed] });
  }
};
