require('dotenv').config(); // ← AJOUTER ÇA
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const warnsPath = path.join(__dirname, '..', 'data', 'warns.json');

module.exports = {
  name: 'warns',
  async execute(message) {
    const target = message.mentions.members.first() || message.member;
    const warns = fs.existsSync(warnsPath) ? JSON.parse(fs.readFileSync(warnsPath)) : {};
    const entries = warns[target.id] || [];
    if (entries.length === 0) return message.channel.send(`${target} n’a aucun warn.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

    const list = entries.map((w, i) => `\`#${i + 1}\` - ${w.reason} *(par ${w.mod} le <t:${Math.floor(new Date(w.date).getTime() / 1000)}>)`).join('\n');
    const embed = new EmbedBuilder()
      .setTitle(`📋 Avertissements de ${target.user.tag}`)
      .setDescription(list)
      .setColor('Orange');

    message.channel.send({ embeds: [embed] }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    await message.delete().catch(() => {});
  }
};