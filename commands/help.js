const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async execute(message) {
    const embed = new EmbedBuilder()
      .setTitle('📚 Commandes disponibles')
      .setColor('#ffffff')
      .setDescription([
        '**🎟️ Tickets**',
        '`+setup-ticket` - Configuration du système de tickets',
        '`+rename <nom>` - Renommer un ticket',
        '`+close` - Fermer un ticket',
        '',
        '**🔨 Modération**',
        '`+warn @user <raison>` - Avertir un membre',
        '`+unwarn @user` - Retirer un avertissement',
        '`+warns @user` - Voir les avertissements',
        '`+kick @user <raison>` - Expulser un membre',
        '`+ban @user <raison>` - Bannir un membre',
        '`+mute @user <durée>` - Rendre muet temporairement',
        '`+unmute @user` - Enlever le mute',
        '`+clear <nombre>` - Supprimer des messages',
        '',
        '**👑 Owner uniquement**',
        '`+embed <texte>` - Envoyer un embed personnalisé',
        '`+say <texte>` - Faire parler le bot',
        '',
        '**📊 Divers**',
        '`+invite @user` - Voir les invitations d’un membre',
      ].join('\n'));

    message.channel.send({ embeds: [embed] });
  }
};