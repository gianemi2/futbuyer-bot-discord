const { MessageEmbed } = require('discord.js')
module.exports = {
    name: 'stonks',
    description: 'Mostra i guadagni più alti fatti con il bot',
    args: false,
    usage: '',
    aliases: [],
    cooldown: 1,
    async execute(message, args) {
        const stonksChannel = message.guild.channels.cache.find(channel => channel.name === '💎stonks');
        const msgs = await stonksChannel.messages.fetch({ limit: 100 })

        const highest = msgs.reduce((prevMsg, currMsg) => prevMsg.content > currMsg.content ? prevMsg : currMsg, { content: 0 })

        const embed = new MessageEmbed()
            .setColor('#00B5FF')
            .setTitle('Più grande guadagno fino ad ora')
            .setDescription(`Guadagno totale: ${highest.content}`)
            .setImage(highest.attachments.first().url)

        message.reply(embed)
    }
};