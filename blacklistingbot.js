require('dotenv').config(); // Laad configuratie uit het .env-bestand

const tmi = require('tmi.js');
const mysql = require('mysql2');
const winston = require('winston'); // Voeg Winston toe
const fs = require('fs'); // Importeer de fs-module voor bestandsbewerking
// Twitch-botconfiguratie
const botConfig = {
  options: { debug: true },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: [], // Laat de kanalen leeg om de bot in alle kanalen toe te staan
};
const botClient = new tmi.Client(botConfig);

// Configureer Winston om naar het logbestand te schrijven
const logger = winston.createLogger({
  level: 'info', // Stel het logniveau in (kan 'info', 'warn', 'error', etc. zijn)
  format: winston.format.simple(), // Gebruik een eenvoudig logformaat
  transports: [
    new winston.transports.File({ filename: 'bot.log' }), // Schrijf naar het logbestand
    // Verwijder het console-transport om geen logberichten naar de console te schrijven
    // new winston.transports.Console(),
  ],
});

// Databaseconfiguratie
const databaseConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Haal de tabelnaam op uit het .env-bestand
const dbTable = process.env.DB_TABLE;

// Haal de waarde van DEBUG_MODE op uit het .env-bestand
const debugMode = process.env.DEBUG_MODE === 'true';

// Functie om te controleren of het bericht afkomstig is van de bot zelf
function isMessageFromBot(tags) {
  return tags.username === botConfig.identity.username;
}

// Functie om logberichten te schrijven met Winston
function writeToDebugFile(message) {
  logger.info(message); // Schrijf een logbericht naar het logbestand
}

// Melding wanneer de bot is verbonden
botClient.on('connected', (address, port) => {
  const connectMessage = `Bot is verbonden op ${address}:${port}`;
  console.log(connectMessage);
  writeToDebugFile(connectMessage);
});

// Voeg een event handler toe voor chatberichten
botClient.on('message', (channel, tags, message, self) => {
  if (!self) {
    const username = tags.username;
    const botUsername = botConfig.identity.username.toLowerCase(); // Gebruikersnaam van de bot in kleine letters

    // Controleer of het bericht aan de bot is gericht
    if (message.toLowerCase().includes(`@${botUsername}`)) {
      console.log('Bericht aan de bot gedetecteerd.');

      // Controleer of het bericht het "!checkusername" commando bevat
      if (message.toLowerCase().includes('!checkusername')) {
        const commandParts = message.split(' ');
        if (commandParts.length === 2) {
          const targetUsername = commandParts[1];

          // Voeg de bot toe aan het kanaal
          botClient.join(channel)
            .then(() => {
              // Controleer de gebruiker in de database en reageer op het bericht
              checkUserInDatabase(targetUsername)
                .then((isUserInDatabase) => {
                  const messageToChat = isUserInDatabase
                    ? `${targetUsername} staat in de database!`
                    : `${targetUsername} is niet gevonden in de database.`;

                  botClient.say(channel, messageToChat);
                  writeToDebugFile(messageToChat);
                })
                .catch((error) => {
                  console.error('Databasefout:', error.message);
                  writeToDebugFile(`Databasefout: ${error.message}`);
                });
            })
            .catch((error) => {
              console.error('Fout bij het toevoegen aan het kanaal:', error);
              writeToDebugFile(`Fout bij het toevoegen aan het kanaal: ${error.message}`);
            });
        } else {
          const usageMessage = `Gebruik: @${botUsername} !checkusername <gebruikersnaam>`;
          botClient.say(channel, usageMessage);
          writeToDebugFile(usageMessage);
        }
      }
    }
  }
});


// Voeg een event handler toe voor chatberichten
try {
botClient.on('message', (channel, tags, message, self) => {
  if (!self) {
    const username = tags.username;

    // Controleer of het bericht een commando is om een gebruikersnaam te controleren
    if (message.toLowerCase() === '!checkusername') {
      console.log('Commando gedetecteerd.');

      const commandParts = message.split(' ');
      if (commandParts.length === 2) {
        const targetUsername = commandParts[1];

        checkUserInDatabase(targetUsername)
          .then((isUserInDatabase) => {
            const messageToChat = isUserInDatabase
              ? `${targetUsername} staat in de database!`
              : `${targetUsername} is niet gevonden in de database.`;

            botClient.say(channel, messageToChat);
            writeToDebugFile(messageToChat);
          })
          .catch((error) => {
            console.error('Databasefout:', error.message);
            writeToDebugFile(`Databasefout: ${error.message}`);
          });
      } else {
        const usageMessage = 'Gebruik: !checkusername <gebruikersnaam>';
        botClient.say(channel, usageMessage);
        writeToDebugFile(usageMessage);
      }
    }
  }
});
} catch (error) {
  console.error('Fout opgetreden:', error);
}

// Functie om gebruiker in de database te controleren
function checkUserInDatabase(username) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(databaseConfig);

    connection.connect();

    const query = `SELECT * FROM ${dbTable} WHERE username = ?`;

    connection.query(query, [username], (error, results) => {
      if (error) {
        console.error('Databasefout bij het uitvoeren van de query:', error);
        writeToDebugFile(`Databasefout: ${error.message}`);
        reject(error);
      } else {
        const isUserInDatabase = results.length > 0;

        if (isUserInDatabase) {
          const logMessage = `${username} is gevonden in de database!`;
          console.log(logMessage);
          writeToDebugFile(logMessage);
        } else {
          const logMessage = `${username} is niet gevonden in de database!`;
          console.log(logMessage);
          writeToDebugFile(logMessage);
        }

        resolve(isUserInDatabase);
      }

      connection.end();
    });
  });
}

botClient.connect().catch(console.error);
