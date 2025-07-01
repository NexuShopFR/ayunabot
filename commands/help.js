const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Commandes disponibles')
      .setColor('#ffffff')
      .setDescription(`**🎟️ Tickets**\n\
+rename <nom> - Renommer un ticket\n\
+close - Fermer un ticket\n\
**🛠️ Modération**\n\
+warn @user <raison> - Avertir un membre\n\
+unwarn @user - Retirer un avertissement\n\
+warns @user - Voir les avertissements\n\
+kick @user <raison> - Expulser un membre\n\
+ban @user <raison> - Bannir un membre\n\
+mute @user <durée> - Rendre muet temporairement\n\
+unmute @user - Enlever le mute\n\
+clear <nombre> - Supprimer des messages\n\
**👑 Bot**\n\
+embed <texte> - Envoyer un embed personnalisé\n\
+say <texte> - Faire parler le bot\n\
+setup-ticket - Configuration du système de tickets\n\
**📦 Divers**\n\
+invite @user - Voir les invitations d’un membre`);

    await message.channel.send({ embeds: [embed] });
  }
};
