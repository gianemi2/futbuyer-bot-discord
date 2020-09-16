require('dotenv').config()

const { HELPERURL } = process.env;
const fetch = require('node-fetch')

module.exports = {
    name: 'cheapest',
    description: 'Fetch cheapest players by rating on futbin',
    args: true,
    usage: '<numero da 81 a 98>',
    aliases: ['c'],
    cooldown: 10,
    execute(message, args) {
        if (args.length == 0) throw new Error('Args are required!')
        const askedRating = parseInt(args[0])
        if (askedRating < 81 || askedRating > 98) throw new Error('Il rating deve essere compreso tra 81 e 98');

        const response = fetch(`${HELPERURL}/v1/cheapestPlayers`).then(res => res.json())
        message.channel.send('Carico...');
        response.then(result => {
            const { success, data } = result
            if (!success) throw new Error("Errore nell'ottenere i dati. Riprova più tardi!")

            const requiredPlayers = data.filter(list => list.rating === askedRating)[0]
            if (requiredPlayers.players.length > 0) {
                const playersOnString = requiredPlayers.players.reduce((previous, current) => previous += `**${current.name}** : ${current.price} \n`, '')
                message.channel.send(playersOnString);
            }
        })
    }
};