require('dotenv').config();
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const OWNER_ID = process.env.OWNER_ID;
const warnsPath = path.join(__dirname, '..', 'data', 'warns.json');

module.exports = {
  name: 'unwarn',
  async execute(message) {
    const target = message.mentions.members.first();
    if (!message.member.roles.cache.has(OWNER_ID)) return message.reply('❌ Permission refusée.');
    if (!target) return message.reply('❌ Mentionne un utilisateur.');
    if (target.roles.cache.has(OWNER_ID)) return message.reply('❌ Pas possible sur un autre owner.');

    const warns = fs.existsSync(warnsPath) ? JSON.parse(fs.readFileSync(warnsPath)) : {};
    if (!warns[target.id] || warns[target.id].length === 0) return message.reply(`${target} n’a aucun avertissement.`);

    warns[target.id].pop();
    fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
    message.channel.send(`${target} a été un-warn.`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    await message.delete().catch(() => {});
  }
};
