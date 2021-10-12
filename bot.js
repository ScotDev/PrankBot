require('dotenv').config();
const axios = require("axios").default;
const schedule = require('node-schedule');
const { bold, italic, blockQuote } = require('@discordjs/builders');

// Discord.js basic config
const { Client, Intents, MessageEmbed } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_WEBHOOKS] });

// Logs bot into server
bot.login(process.env.BOT_TOKEN)

bot.once('ready', () => {
    console.log(`${bot.user.username} is ready!`);
});

// Custom debug config
let debug = false;

const setDebug = async (message) => {
    debug = !debug
    let formattedMsg = blockQuote(`Debug state has been set to ${debug}`)
    message.channel.send(formattedMsg)
    console.log(`Debug state is ${debug}`)
}

// Custom functions
// Keyword triggers
const checkJokes = (message) => {

    const dadOptions = {
        method: 'GET',
        url: 'https://dad-jokes.p.rapidapi.com/random/joke',
        headers: {
            'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
            'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
        }
    };

    const [...words] = message.content
        .trim()
        .substring(0)
        // Matches whitespace
        .split(/\s+/)

    // console.log(words)

    // Declared test cases (keywords)
    // Could be improved with case insensitivity in regex. Currently not important enough to change.
    const jokeVals = ["patter", "joke", "funny", "Patter", "Joke", "Funny"]
    // Tests to see if message content includes the specified keywords
    if (jokeVals.some(item => words.includes(item))) {
        message.reply("Oh you think that's funny?")
        axios.request(dadOptions).then((res) => {
            message.channel.send(res.data.body[0].setup)
            message.channel.send(res.data.body[0].punchline)
        }).catch((err) => {
            let status = err.response.status
            if (status === 429) {
                message.channel.send("Daily call limit for jokes reached, limit will reset in 24 hours")
            }
            // if (String(status).startsWith("5")) {
            //     message.channel.send("Could not retrieve joke, server issue")
            // }
            if (debug) {
                const formattedMessage = blockQuote(italic(`Server response code: ${String(status)}`));
                message.channel.send(formattedMessage)
                console.log(err)
            }
        })
    }
}

bot.on('messageCreate', message => {
    // Ignores bot messages so it doesn't reply in a loop to itself
    if (message.author.bot) return;
    checkJokes(message)
    getGifByKeyword(message)

    if (message.content.includes("bean") || message.content.includes("Bean")) {
        message.reply({ content: "You got frickin beaned kid!", files: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Heinz_Beanz.jpg/320px-Heinz_Beanz.jpg"] })
    }

    if (message.content.includes("cabbage") || message.content.includes("Cabbage")) {
        message.reply({ content: "You're getting cabbaged tonight mate" })
        message.reply({ content: "https://www.youtube.com/watch?v=QxBsClrLPEU&t=1s" })
    }

    if (message.content.includes("d&d") || message.content.includes("D&D") || message.content.includes("D&d")) {
        message.channel.send("Roll a new character")
    }
})

// Thread creator
const createThread = async (message) => {
    let channelID;
    const thread = await message.channel.threads.create({
        name: "New AI chat thread",
        autoArchiveDuration: 60,
        reason: 'New AI chat thread'
        // startMessage: message.id
    })
        .then(threadChannel => {
            console.log(threadChannel.id)
            channelID = threadChannel.id
        })
        .catch(console.error);


    // const latestThread = message.channel.threads.cache.find(x => x.name === "New AI chat thread")
    const latestThread = message.channel.threads.cache.find(x => x.id === channelID)
    // if (latestThread.joinable) await latestThread.join()
    const chatWelcomeMsg = bold("You've started a new conversation with an advanced AI chatbot. Ask it anything!")
    latestThread.send(chatWelcomeMsg)
    const archiveWarning = italic("This chat wil auto-archive if no messages are sent or received for 60 minutes")
    latestThread.send(archiveWarning)
}
// Get GIF by id
const getGifbyId = async (message, args) => {
    switch (args[0]) {
        case "oof":
            gifID = 11168012;
            break;
        // case "blahem":
        //     gifID = 21643022;
        //     break
        case "naw":
            gifID = 14030300;
            break
        case "dance":
            gifID = 18802854;
            break
        case "thatcher":
            gifID = 18802854;
            break
        case "weans":
            gifID = 20022960;
            break
        default:
            gifID = 14030300;
    }

    const tenorOptions = {
        method: "get",
        url: `https://g.tenor.com/v1/gifs?ids=${gifID}&key=${process.env.TENOR_KEY}`,
    }
    let status;
    axios.request(tenorOptions)
        .then(res => {
            if (debug) {
                console.log(res.status)
                status = res.status;
                const formattedMessage = blockQuote(italic(`Server response code: ${String(status)}`));
                message.channel.send(formattedMessage)
            }
            message.channel.send(res.data.results[0].url)
        })
        .catch((err) => {
            if (err) {
                message.channel.send("Could not retrieve gif right now")
                console.log(err)
            }
        })
}
// Get GIF by keyword match
const getGifByKeyword = async (message) => {
    const [...words] = message.content
        .trim()
        .substring(0)
        // Matches whitespace
        .split(/\s+/)

    // console.log(words)

    const randomNumInRange = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // Declared test cases (keywords)
    const keywordVals = ["cum", "blahem", "limmy", "Cum", "Blahem", "Limmy"]
    // Tests to see if message content includes the specified keywords
    if (keywordVals.some(item => words.includes(item))) {
        message.reply("Check this out")
        const tenorOptions = {
            method: "get",
            url: `https://g.tenor.com/v1/search?q=${message}&key=${process.env.TENOR_KEY}`,
        }
        let status;
        let count;
        axios.request(tenorOptions)
            // .then(res => console.log(res.data.results[0].url))
            .then(res => {
                count = res.data.results.length
                if (debug) {
                    // console.log(res)
                    console.log("Count: ", count)
                    status = res.status;
                    console.log(status)
                    const formattedMessage = blockQuote(italic(`Server response code: ${String(status)}`));
                    message.channel.send(formattedMessage)
                }
                if (count > 0) {
                    const randInt = randomNumInRange(1, count)
                    message.channel.send(res.data.results[randInt].url)
                } else {
                    message.channel.send("No results found for that search term!")
                }
            })
            .catch((err) => {
                console.log(err)
                if (err) {
                    message.channel.send("Could not retrieve gifs right now")
                }
            })

    }
}

// const getGifbySearchTerm = (message, args) => {

// }

// Show list of command
const showHelpMenu = (message) => {
    const helpEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle("List of commands")
        .setDescription('Commands accepted by this bot')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/e/e3/Limmy86times.jpg')
        .setAuthor('ScotDev', 'https://avatars.githubusercontent.com/u/44685094?v=4', 'https://github.com/ScotDev/PrankBot')
        .addFields(
            { name: '?help', value: 'Shows list of commands', inline: true },
            { name: '?gif oof', value: 'Posts limmy oof gif', inline: true },
            { name: '?gif naw', value: 'Posts limmy naw gif', inline: true },
            { name: '?gif weans', value: 'Posts limmy weans gif', inline: true },
            { name: '?gif dance', value: 'Posts dancing on Thatcher\'s grave  gif', inline: true },
            // { name: '?chat', value: 'Starts chat thread (INCOMPLETE DEVELOPMENT)', inline: true },
            { name: 'Keywords', value: 'Typing "Limmy", "blahem" or "cum" will find a related gif', inline: true },
            { name: 'Easter eggs', value: 'There are some partially hidden easter eggs linked to keywords :)', inline: true },
            { name: '?debug', value: 'Turns on debugger. Using command again will turn off', inline: true }
        )
        .setFooter('ScotDev', 'https://avatars.githubusercontent.com/u/44685094?v=4');
    message.channel.send({ embeds: [helpEmbed] })
}

// COMMANDS
const PREFIX = "?";

bot.on('messageCreate', message => {
    // Ignores bot messages so it doesn't reply in a loop to itself
    if (message.author.bot) return;

    // Parse commands and arguments
    if (message.content.startsWith(PREFIX)) {
        const [COMMAND_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            // Matches whitespace
            .split(/\s+/)

        // if (COMMAND_NAME === "test") {
        //     console.log("cmd test")
        // }
        if (COMMAND_NAME === "chat") {
            createThread(message)
        }
        if (COMMAND_NAME === "gif") {
            getGifbyId(message, args)
        }
        if (COMMAND_NAME === "help") {
            showHelpMenu(message)
        }
        if (COMMAND_NAME === "debug") {
            setDebug(message, args)
        }
    }
})

// Scheduled functions
const rule = new schedule.RecurrenceRule();
rule.hour = 04;
rule.minute = 00;
const job = schedule.scheduleJob(rule, function () {
    const generalChannel = bot.channels.cache.find(channel => channel.name === 'general');
    generalChannel.send("https://i.imgur.com/qufjBuS.jpg")
});
