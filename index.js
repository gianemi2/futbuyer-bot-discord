const fs = require('fs');
const Discord = require('discord.js');
var cors = require('cors');

require('dotenv').config()

const { CMDPREFIX, TOKEN } = process.env;
const cron = require('cron')
const getLastYearSBC = require('./cronjob/getLastYearSBC.js')
const ping = require('./cronjob/ping')

const express = require('express')
const app = express()
app.use(cors());
const port = process.env.PORT || 5000

app.get('/woofut/pending', (req, res) => {
    console.log('pending');
    res.json({ status: 'ok' })
})
app.get('/woofut/active', (req, res) => {
    console.log('active');
    res.json({ status: 'ok' })
})
app.get('/woofut/pending-cancel', (req, res) => {
    console.log('pending-cancel');
    res.json({ status: 'ok' })
})
app.get('/woofut/on-hold', (req, res) => {
    console.log('on-hold');
    res.json({ status: 'ok' })
})
app.get('/woofut/cancelled', (req, res) => {
    console.log('cancelled');
    res.json({ status: 'ok' })
})

app.get('/', (req, res) => {
    res.send('🎵 POTEVO ESSERE UN TOSSICO MORTO E INVECE SONO UN TOSSICO RICCO!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

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


for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log('ready')
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
client.login(TOKEN)