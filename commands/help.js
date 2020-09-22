require('dotenv').config()
const { CMDPREFIX } = process.env

module.exports = {
    name: 'help',
    description: 'Mostra tutti i comandi attualmente sviluppati, oppure se specificato un comando informazioni su un comando in particolare.',
    usage: '<nome del comando>',
    aliases: ['h'],
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('Here\'s a list of all my commands:');
            data.push(commands.map(command => `\`${command.name}\``).join('\n'));
            data.push(`\nYou can send \`${CMDPREFIX}help [command name]\` to get info on a specific command!`);

            return message.channel.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }
    }
};