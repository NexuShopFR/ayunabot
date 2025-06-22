require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

module.exports = {
  name: 'help',
  async execute(message) {
    if (!message.member.roles.cache.has(STAFF_ROLE_ID)) return message.reply('❌ Commande réservée au staff.');

    const helpEmbed = new EmbedBuilder()
      .setTitle('📜 Commandes Modération')
      .setDescription(`
• +ban @user [raison] → Bannir un membre
• +kick @user [raison] → Expulser un membre
• +mute @user durée [raison] → Mute temporaire
• +unmute @user → Enlever le mute
• +warn @user [raison] → Ajouter un avertissement
• +unwarn @user → Enlever le dernier avertissement
• +warns [@user] → Voir les warns d’un membre
• +clear <nombre> → Supprimer X messages
• +setup-ticket → Initialiser les tickets (propriétaire uniquement)
• +help → Voir ce message
      `)
      .setColor('Blue')
      .setFooter({ text: 'Support: discord.gg/nexushop' });

    await message.channel.send({ embeds: [helpEmbed] });
    await message.delete().catch(() => {});
  }
};
