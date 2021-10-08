require('dotenv').config();
const axios = require("axios").default;
const schedule = require('node-schedule');

const dadOptions = {
    method: 'GET',
    url: 'https://dad-jokes.p.rapidapi.com/random/joke',
    headers: {
        'x-rapidapi-host': process.env.X_RAPIDAPI_HOST,
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
    }
};

const { Client, Intents, MessageEmbed } = require('discord.js');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_WEBHOOKS] });

bot.login(process.env.BOT_TOKEN)

bot.once('ready', () => {
    console.log(`${bot.user.username} is ready!`);
});

// Keyword triggers
const checkJokes = (message) => {

    const [...words] = message.content
        .trim()
        .substring(0)
        // Matches whitespace
        .split(/\s+/)

    console.log(words)

    // Declared test cases (keywords)
    const jokeVals = ["patter", "joke", "funny"]
    // Tests to see if message content includes the specified keywords
    if (jokeVals.some(item => words.includes(item))) {
        message.reply("Oh you think that's funny?")
        axios.request(dadOptions).then((res) => {
            message.channel.send(res.data.body[0].setup)
            message.channel.send(res.data.body[0].punchline)
            if (!res.data.success) {
                message.channel.send("Could not retrieve joke, daily call limit reached")
            }
        }).catch((err) => {
            console.log(err)
            if (err) {
                message.channel.send("Could not retrieve joke, unspecified error")
            }
        })
    }
}

bot.on('messageCreate', message => {
    // Ignores bot messages so it doesn't reply in a loop to itself
    if (message.author.bot) return;
    checkJokes(message)

    if (message.content.includes("bean")) {
        console.log("beaned")
        message.reply({ content: "You got frickin beaned kid!", files: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Heinz_Beanz.jpg/320px-Heinz_Beanz.jpg"] })
    }

    if (message.content.includes("cabbage")) {
        console.log("Cabbaged")
        message.reply({ content: "You're getting cabbaged tonight mate" })
        message.reply({ content: "https://www.youtube.com/watch?v=QxBsClrLPEU&t=1s" })
    }

    if (message.content.includes("d&d")) {
        message.channel.send("Roll a new character")
    }
})

// COMMANDS
const PREFIX = "?";

// Thread creator function
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
    console.log(channelID)
    latestThread.send("You've started a new conversation with an advanced AI chatbot. Ask it anything!")
    latestThread.send("This chat wil auto-archive if no messages are sent or received for 60 minutes")
}
// Get GIF by id
const getGifbyId = (message, args) => {
    switch (args[0]) {
        case "oof":
            gifID = 11168012;
            break;
        case "blahem":
            gifID = 21643022;
            break
        case "naw":
            gifID = 14030300;
            break
        case "dance":
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
    axios.request(tenorOptions)
        // .then(res => console.log(res.data.results[0].url))
        .then(res => message.channel.send(res.data.results[0].url))
        .catch((err) => {
            console.log(err)
            if (err) {
                message.channel.send("Could not retrieve gif right now, unspecified error")
            }
        })
}

// Show list of command
const showHelpMenu = (message) => {
    const helpEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle("List of commands")
        .setDescription('Commands accepted by this bot')
        .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/e/e3/Limmy86times.jpg')
        .addFields(
            // { name: 'Current commands', value: 'Some value here' },
            // { name: '\u200B', value: '\u200B' },
            { name: '?help', value: 'Shows list of commands', inline: true },
            { name: '?gif oof', value: 'Posts limmy oof gif', inline: true },
            { name: '?gif naw', value: 'Posts limmy naw gif', inline: true },
            { name: '?gif blahem', value: 'Posts limmy blahem gif', inline: true },
            { name: '?gif weans', value: 'Posts limmy weans gif', inline: true },
            { name: '?gif dance', value: 'Posts dancing on Thatcher\'s grave  gif', inline: true },
            { name: '?gif dance', value: 'Posts dancing on Thatcher\'s grave  gif', inline: true },
            { name: '?chat', value: 'Starts chat thread (INCOMPLETE DEVELOPMENT)', inline: true },
            { name: 'Easter eggs', value: 'There are some partially hidden easter eggs linked to keywords :)', inline: true },
        )
        .setFooter('ScotDev', 'https://avatars.githubusercontent.com/u/44685094?v=4');
    message.channel.send({ embeds: [helpEmbed] })
}

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

        if (COMMAND_NAME === "test") {
            console.log("cmd test")
        }
        if (COMMAND_NAME === "chat") {
            createThread(message)
        }
        if (COMMAND_NAME === "gif") {
            getGifbyId(message, args)
        }
        if (COMMAND_NAME === "help") {
            showHelpMenu(message)
        }
    }
})

// Scheduled functions
const rule = new schedule.RecurrenceRule();
rule.hour = 05;
rule.minute = 00;

// const client = new Discord.Client();
// const generalChannel = bot.channels.cache.find(channel => channel.name === 'general');
// const channel = client.channels.get("563083228274098238");
const job = schedule.scheduleJob(rule, function () {
    const generalChannel = bot.channels.cache.find(channel => channel.name === 'general');
    generalChannel.send("https://i.imgur.com/qufjBuS.jpg")
});
