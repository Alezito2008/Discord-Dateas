const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const cheerio = require('cheerio');
const dateas = require('./dateas')
const fs = require('fs')

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Define the commands with properly defined options and subcommands
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'logs',
        description: 'Logs'
    },
    {
        name: 'dateas',
        description: 'Busca información en dateas',
        options: [
            {
                name: 'nombre',
                description: 'Nombre de la persona a buscar',
                type: 3,
                required: true,
            }
        ]
    }
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (global) commands.');

        // Register the commands globally
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log("Successfully registered application commands.");
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log('Bot iniciado');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'ping') {
        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setColor(0x00AE86);
        await interaction.reply({ embeds: [embed] });
    }
    
    else if (commandName === 'dateas') {
        try {

            const busqueda = options.getString('nombre');
    
            const datos = await dateas(busqueda);
    
            const embed = new EmbedBuilder()
                .setTitle(`Información de ${datos.nombre}`)
                .addFields({
                    name: 'Nombre',
                    value: datos.nombre
                }, {
                    name: 'CUIL',
                    value: datos.cuil
                }, {
                    name: 'DNI',
                    value: datos.dni
                }, {
                    name: 'Link',
                    value: datos.link
                })
                .setColor(0x00AE86);
    
            console.log(`Enviada respuesta a ${interaction.user.tag} sobre ${datos.nombre}`);
            fs.appendFileSync('log.txt', `[${new Date(Date.now()).toString()}] Enviada respuesta a ${interaction.user.tag} sobre ${datos.nombre}\n`);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(error)
            const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('No se encontraron resultados')
            .setColor(0xFF0000);
            await interaction.reply({ embeds: [embed] });
        }
    }

    else if (commandName == 'logs') {
        const log = fs.readFileSync('log.txt', 'utf8');
        const lines = log.split('\n');
        const lastLines = lines.slice(-50).join('\n');
        await interaction.reply('```'+lastLines+'```');
    }
});

// Login the client
client.login(process.env.DISCORD_TOKEN);
