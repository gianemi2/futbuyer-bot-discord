module.exports = {
    name: 'me',
    description: 'Ti mostro il tuo nome discord e il tuo id!',
    args: false,
    usage: '',
    aliases: ['io', 'chisono'],
    cooldown: 10,
    execute(message, args) {
        message.reply(`Il tuo nome è **${message.author.username}#${message.author.discriminator}** e il tuo id è: **${message.author.id}**`)
    }
};