require('dotenv').config();
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

module.exports = async (client) => {
  const GUILD_ID = process.env.GUILD_ID;
  const AVIS_PANEL_CHANNEL_ID = process.env.AVIS_PANEL_CHANNEL_ID;

  if (!GUILD_ID || !AVIS_PANEL_CHANNEL_ID) {
    return console.error('❌ GUILD_ID ou AVIS_PANEL_CHANNEL_ID manquant dans .env');
  }

  const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);
  if (!guild) return console.error('❌ Serveur introuvable.');

  const avisChannel = guild.channels.cache.get(AVIS_PANEL_CHANNEL_ID);
  if (!avisChannel) return console.error('❌ Salon Avis introuvable.');

  const embed = new EmbedBuilder()
    .setTitle('💬 Ouvre un ticket Avis')
    .setDescription(`Tu souhaites laisser un avis sur ton expérience ?

Clique sur le bouton **Avis** pour ouvrir un ticket.

🪙 Chaque avis validé est rémunéré **0,50€**.
Merci de rester respectueux.`)
    .setColor("White")
    .setImage('https://i.imgur.com/iaLkMmW.gif');

  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket-select')
    .setPlaceholder('📩 Choisis un type de ticket')
    .addOptions([
      { label: '🪙 Avis', value: 'avis', description: 'Créer ton ticket pour faire des avis' },
      { label: '❌ Annuler', value: 'cancel', description: 'Annuler la création de ticket' }
    ]);

  const row = new ActionRowBuilder().addComponents(select);

  await avisChannel.send({ embeds: [embed], components: [row] });
};
