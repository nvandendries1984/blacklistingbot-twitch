require('dotenv').config(); // Laad configuratie uit het .env-bestand

const tmi = require('tmi.js');
const mysql = require('mysql2');

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

const botClient = new tmi.Client(botConfig);

botClient.on('connected', (address, port) => {
  console.log(`Bot is verbonden op ${address}:${port}`);
});

// Functie om te controleren of het bericht afkomstig is van de broadcaster
function isMessageFromBroadcaster(tags) {
  return tags.username === broadcasterUsername;
}

botClient.on('message', (channel, tags, message, self) => {
  if (!self) { // Controleer of het bericht niet van de bot zelf is
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
            botClient.say(channel, `${username} staat in de database!`);
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
        reject(error);
      } else {
        resolve(results.length > 0);
      }

      connection.end();
    });
  });
}

botClient.connect().catch(console.error);
