const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show a list of all commands',
  usage: '.help',

  async execute(message) {
    const commandsPath = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    let helpMessage = '📜 **NexuShop Commands:**\n\n';

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (!command.name || !command.description) continue;

      helpMessage += `**.${command.name}** — ${command.description}`;
      if (command.usage) helpMessage += `\n_Usage:_ \`${command.usage}\``;
      helpMessage += '\n\n';
    }

    message.channel.send(helpMessage);
  }
};