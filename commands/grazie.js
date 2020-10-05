module.exports = {
    name: 'grazie',
    description: 'Ti mostro il tuo nome discord e il tuo id!',
    args: false,
    usage: '',
    aliases: [],
    cooldown: 1,
    execute(message, args) {
        message.reply(`Potevo essere un tossico morto, e invece sono un tossico ricco. 🖕🏻`);
    }
};