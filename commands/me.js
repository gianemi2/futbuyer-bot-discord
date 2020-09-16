module.exports = {
    name: 'me',
    description: 'Ti mostro il tuo nome discord e il tuo id!',
    args: false,
    usage: '',
    aliases: ['io', 'chisono'],
    cooldown: 10,
    execute(message, args) {
        message.reply(`Fra ti chiami **${message.author.username}#${message.author.discriminator}**, che ti sei fatto? Il tuo id è: **${message.author.id}**. Bella seguimi su Spotify!`)
    }
};