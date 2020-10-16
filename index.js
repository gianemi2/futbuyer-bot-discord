const fs = require('fs');
const Discord = require('discord.js');
const open = require('open')
const cors = require('cors');

require('dotenv').config()

const { CMDPREFIX, TOKEN } = process.env;
const cron = require('cron')
const getLastYearSBC = require('./cronjob/getLastYearSBC.js')
const ping = require('./cronjob/ping')
const { getMostUsedPlayers } = require('./api/futbin')

const { generateToken, createUserInGroups, removeUserFromGroup } = require('./api/google')

const express = require('express')
const app = express()
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const serverID = '748464440340512859';

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const pingGlitch = new cron.CronJob('* * * * *', ping)
pingGlitch.start()

const sendLastYearSBC = new cron.CronJob('0 0 * * 0', () => {
    getLastYearSBC()
        .then(res => {
            const channel = client.channels.cache.find(channel => channel.id === '755454500558340218')
            const message = res.future.reduce((prev, curr) => `${prev}\n ${curr.title}`, '')
            channel.send(message)
        })
})
sendLastYearSBC.start()

app.get('/google', (req, res) => {
    console.log(generateToken)
})

app.get('/google/oauth2callback', (req, res) => {
    res.json(req.query)
})

app.post('/woofut/pending', (req, res) => {
    const { id } = req.body
    sendPM(id, 'Il tuo bot FUTBUYER è in fase di attivazione. Appena il pagamento sarà confermato ti arriverà un nuovo messaggio di conferma. ')
    res.json(req.body)
})
app.post('/woofut/active', async (req, res) => {
    const { id, gmail } = req.body
    sendPM(id, 'Il tuo bot è attivo. Buon divertimento.')
    const userRoles = await getUserRoles(id);
    const { futureStars, bronzini } = await getActionsRoles();

    let isAlreadyFutureStar = false
    userRoles.cache.forEach((role) => {
        isAlreadyFutureStar = role.name === 'FUTURE STARS' ? true : false
    })
    if (!isAlreadyFutureStar) {
        userRoles.add(futureStars);
        userRoles.remove(bronzini);
    }
    const googleResponse = await createUserInGroups(gmail);
    console.log(googleResponse)
    res.json(req.body)
})
app.post('/woofut/pending-cancel', (req, res) => {
    const { id } = req.body
    sendPM(id, 'Ci dispiace molto vedere che te ne stai andando... È stato un piacere averti con noi. Abbi cura di te! Ricorda se vuoi tornare non devi far altro che tornare su https://futbuyer.it e creare un nuovo abbonamento.')
    res.json(req.body)
})
app.post('/woofut/on-hold', (req, res) => {
    const { id } = req.body
    sendPM(id, 'Sembra che ci siano dei problemi con il metodo di pagamento. Effettueremo un nuovo tentativo fra poco. ');
    res.json(req.body)
})
app.post('/woofut/cancelled', async (req, res) => {
    const { id, gmail } = req.body
    const userRoles = await getUserRoles(id);
    const { futureStars, bronzini } = await getActionsRoles();

    sendPM(id, 'Ti confermiamo la cancellazione del bot FUTBUYER. Probabilmente il bot era scaduto da più di 3 giorni oppure hai deciso te di cancellarlo. Se vuoi riattivare la sottoscrizione procedi al rinnovo su https://futbuyer.it ')
    userRoles.add(bronzini);
    userRoles.remove(futureStars);

    const googleResponse = await removeUserFromGroup(gmail)
    console.log(googleResponse)
    res.json(req.body)
})
app.get('/v1/mostUsedPlayers', async (req, res) => {
    const { sbc } = req.query
    const players = await getMostUsedPlayers(sbc)

    res.json(players)
})
app.get('/', async (req, res) => {
    //res.send('ok');
    getMostUsedPlayers('s')
    res.send('🎵 POTEVO ESSERE UN TOSSICO MORTO E INVECE SONO UN TOSSICO RICCO!')
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    const today = new Date().getDay()
    const playing = today >= 5 || today == 0 ? 'Weekend League' : 'Division Rivals'
    client.user.setPresence({
        activity: {
            name: playing
        }
    })
})

client.on('message', message => {
    if (!message.content.startsWith(CMDPREFIX) || message.author.bot) return;
    const args = message.content.slice(CMDPREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.args && !args.length) {
        let reply = `Non hai passato alcun valore, ${message.author}!`;
        if (command.usage) {
            reply = `${reply}\n il comando dovrebbe essere qualcosa tipo: \n *${CMDPREFIX}${command.name} ${command.usage}*`
        }
        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`attendi ${timeLeft.toFixed(1)} altri secondo(i) prima di riutilizzare il comando \`${command.name}\`.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        message.reply(error.message);
    }
});
//client.login(TOKEN)

const sendPM = async (userID, PM) => {
    try {
        const user = await getUser(userID);
        const dmChannel = await user.createDM();
        dmChannel.send(PM);
    } catch (error) {
        console.error(handleDefaultDiscordError(error));
    }
}

const getUserRoles = async (userID) => {
    try {
        const user = await getUser(userID);
        return user.roles;
    } catch (error) {
        console.error(handleDefaultDiscordError(error));
    }
}

const getActionsRoles = async () => {
    const server = await client.guilds.fetch(serverID);
    const futureStars = server.roles.cache.find(role => role.name === 'FUTURE STARS');
    const bronzini = server.roles.cache.find(role => role.name === 'BRONZINI');

    return { futureStars, bronzini }
}

const getUser = async (userID) => {
    try {
        const server = await client.guilds.fetch(serverID);
        const user = await server.members.fetch(userID)
        return user;
    } catch (error) {
        console.error(handleDefaultDiscordError(error));
    }
}

const handleDefaultDiscordError = (error) => {
    let message
    switch (error.code) {
        case 50001:
            return message = `Errore. Server non trovato oppure il bot non ha accesso. Server ID: ${serverID}`
        case 10013:
            return message = `Errore. Utente non trovato. Utente: ${userID}`
        default:
            return error.message;
            break;
    }
}