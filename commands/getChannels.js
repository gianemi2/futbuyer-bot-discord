module.exports = {
    name: 'getChannels',
    description: 'Invio in PM tutti i canali con il relativo ID!',
    args: false,
    usage: '',
    aliases: ['getCH', 'ch'],
    cooldown: 10,
    execute(message, args) {
        const msg = message.guild.channels.cache.reduce((prev, currCh) => `${prev}${currCh.name} : ${currCh.id}\n`, `\n`);
        message.reply(msg)
    }
};