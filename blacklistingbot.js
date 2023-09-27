require('dotenv').config(); // Laad configuratie uit het .env-bestand

const tmi = require('tmi.js');
const mysql = require('mysql2');
const fs = require('fs'); // Importeer de fs-module voor bestandsbewerking

// Twitch-botconfiguratie
const botConfig = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: [process.env.CHANNEL_NAME],
};

// Databaseconfiguratie
const databaseConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Haal de tabelnaam op uit het .env-bestand
const dbTable = process.env.DB_TABLE;

// Haal de gebruikersnaam van de broadcaster op uit het .env-bestand
const broadcasterUsername = process.env.BROADCASTER_USERNAME;

// Haal de waarde van DEBUG_MODE op uit het .env-bestand
const debugMode = process.env.DEBUG_MODE === 'true';

const botClient = new tmi.Client(botConfig);

// Functie om te controleren of het bericht afkomstig is van de broadcaster
function isMessageFromBroadcaster(tags) {
  return tags.username === broadcasterUsername;
}

// Debugging-informatie naar bestand schrijven
function writeToDebugFile(message) {
  if (debugMode) {
    fs.appendFile('bot.log', message + '\n', (err) => {
      if (err) {
        console.error('Fout bij schrijven naar debug-bestand:', err);
      }
    });
  }
}

// Melding wanneer de bot is verbonden
botClient.on('connected', (address, port) => {
  const connectMessage = `Bot is verbonden op ${address}:${port}`;
  console.log(connectMessage); // Optioneel: melding ook naar de console
  writeToDebugFile(connectMessage); // Schrijf verbindingsmelding naar bestand
});

botClient.on('message', (channel, tags, message, self) => {
  if (!self || (self && checkBotMessages)) { // Controleer of het bericht niet van de bot zelf is, tenzij geconfigureerd om te controleren
    const username = tags.username;

    // Controleer of het bericht afkomstig is van de broadcaster
    if (isMessageFromBroadcaster(tags)) {
      // Doe hier niets als het bericht afkomstig is van de broadcaster zelf
    } else {
      // Controleer de gebruiker in de database en stuur melding naar broadcaster indien nodig
      checkUserInDatabase(username)
        .then((isUserInDatabase) => {
          if (isUserInDatabase) {
            // Stuur een melding naar de broadcaster als de gebruiker in de database staat
            const messageToBroadcaster = `${username} staat in de database!`;
            writeToDebugFile(messageToBroadcaster); // Schrijf debug-bericht naar bestand
            botClient.say(channel, messageToBroadcaster);
          }
        })
        .catch((error) => {
          console.error('Databasefout:', error.message);
        });
    }
  }
});

// Functie om gebruiker in de database te controleren
function checkUserInDatabase(username) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection(databaseConfig);

    connection.connect();

    // Gebruik de waarde van dbTable om de tabelnaam in de query in te stellen
    const query = `SELECT * FROM ${dbTable} WHERE username = ?`;

    connection.query(query, [username], (error, results) => {
      if (error) {
        console.error('Databasefout bij het uitvoeren van de query:', error); // Voeg dit toe voor debugging
        reject(error);
      } else {
        const isUserInDatabase = results.length > 0;

        if (isUserInDatabase) {
          const logMessage = `${username} is gevonden in de database!`;
          console.log(logMessage); // Voeg dit toe voor debugging
          writeToDebugFile(logMessage); // Schrijf debug-bericht naar bestand
        } else {
          const logMessage = `${username} is niet gevonden in de database!`;
          console.log(logMessage); // Voeg dit toe voor debugging
          writeToDebugFile(logMessage); // Schrijf debug-bericht naar bestand
        }

        resolve(isUserInDatabase);
      }

      connection.end();
    });
  });
}

botClient.connect().catch(console.error);
