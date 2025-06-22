// 📁 utils/welcomeEmbed.js
const { EmbedBuilder } = require('discord.js');

module.exports = async (member) => {
  // ✅ Welcome in public channel
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (channel) {
    const embed = new EmbedBuilder()
      .setTitle('Welcome to NexuShop')
      .setDescription(`Hello ${member}, welcome to **NexuShop**!`)
      .setColor('#ffffff')
      .setImage("https://auto.creavite.co/api/out/Yojdi6y2Kbbnsy9trz_standard .gif")
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }

  // 📩 Welcome DM
  try {
    await member.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("👋 Welcome to NexuShop!")
          .setDescription("Thanks for joining **NexuShop**.\n\nIf you need help, feel free to open a ticket in the server.\nEnjoy your stay!")
          .setColor("Green")
          .setTimestamp()
      ]
    });
    console.log(`📬 Sent welcome DM to ${member.user.tag}`);
  } catch (err) {
    console.warn(`⚠️ Could not send DM to ${member.user.tag}`);
  }

  // 🎁 Auto-role
  const autoRoleId = process.env.AUTO_ROLE_ID;
  if (autoRoleId) {
    const role = member.guild.roles.cache.get(autoRoleId);
    if (role) {
      try {
        await member.roles.add(role);
        console.log(`✅ Auto-role given to ${member.user.tag}`);
      } catch (err) {
        console.error('❌ Failed to assign role:', err);
      }
    }
  }
};
