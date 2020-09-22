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
            data.push(commands.map(command => `\`${command.name}\` ${command.usage} ${command.description}`).join('\n'));

            return message.channel.send(data)
        }
    }
};