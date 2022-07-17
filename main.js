const config = require("./config.json");
const fs = require("fs");
const {
    REST
} = require("@discordjs/rest");
const {
    Routes
} = require("discord-api-types/v9");
const {
    Client,
    Intents,
    Collection,
    MessageAttachment
} = require("discord.js");

//Tell Discord the scope of the bot
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES
    ]
});

//Finds all files that end with ".js" in the commands folder
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

//Register Commands
const commands = [];
client.commands = new Collection();
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}


//When Client ready
client.once("ready", () => {
    console.log("Bot Online!")
    client.user.setActivity(config.profile.status_message)

    const CLIENT_ID = client.user.id;

    const rest = new REST({
        version: "9"
    }).setToken(config.token);

    //Set slash Commands With The Discord API
    (async () => {
        try {
            await rest.put(Routes.applicationCommands(CLIENT_ID), {
                body: commands
            });
            console.log("Added Global Slash Commands")
        } catch (err) {
            if (err) {
                console.error(err)
            };
        }
    })();


});

//On Slash Command Issued
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        if (err) {
            console.error(err);
            await interaction.reply({
                content: config.language.error_message_general_slashcommand.message,
                emphemeral: config.language.error_message_general_slashcommand.emphemeral
            });
        }
    }
});


//Interactions

//Save Image Button Interaction
//This will send the current Image to the users DM's
client.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
    if (interaction.customId === "save-img") {
        
        var first = [...interaction.message.attachments][0]
        console.log(first[1].attachment)
        var attachment = new MessageAttachment(first[1].attachment);
        interaction.user.send({
            content: config.language.img_message_save_dm.message,
            files: [attachment]
        });
        interaction.reply({
            content: config.language.img_message_save.message,
            ephemeral: config.language.img_message_save.emphemeral
        })
    }
});



//Login
client.login(config.token)