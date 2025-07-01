const {
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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
    .setDescription(`Tu souhaites laisser un avis sur ton expérience ?\n
Clique sur le bouton **Avis** pour ouvrir un ticket.\n\n
🪙 Chaque avis validé est rémunéré **0,50€**.\nMerci de rester respectueux.`)
    .setImage('https://i.imgur.com/iaLkMmW.gif')
    .setColor('#ffffff');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('avis')
      .setLabel('Avis')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Annulé')
      .setStyle(ButtonStyle.Danger)
  );

  await avisChannel.bulkDelete(10).catch(() => {});
  await avisChannel.send({ embeds: [embed], components: [row] });

  console.log('📩 Panel ticket Avis envoyé avec succès');
};