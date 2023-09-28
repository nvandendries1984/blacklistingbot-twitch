# Twitch Chatbot met MySQL-integratie

Dit Markdown-document bevat documentatie voor de gegeven Node.js-code, die een Twitch-chatbot implementeert met integratie van een MySQL-database.

## Vereiste bibliotheken

De code maakt gebruik van verschillende externe bibliotheken, die aan het begin van het script worden geïmporteerd:

- `dotenv`: Een bibliotheek voor het laden van configuratiegegevens uit een `.env`-bestand.
- `tmi.js`: Een bibliotheek voor het werken met de Twitch Chat API.
- `mysql2`: Een bibliotheek voor het werken met MySQL-databases.
- `fs`: De file system-module voor bestandsbewerking.

## Configuratie

De code haalt verschillende configuratiegegevens op uit het `.env`-bestand, zoals de botidentiteit, kanaalnaam, database-instellingen en debug-modus.

## Twitch-botconfiguratie

Een object `botConfig` wordt gedefinieerd met de Twitch-botconfiguratie, inclusief gebruikersnaam en OAuth-token.

## Databaseconfiguratie

Een object `databaseConfig` wordt gedefinieerd met de database-instellingen, zoals host, gebruikersnaam, wachtwoord en database-naam.

## Andere configuratie

De code haalt extra informatie op uit het `.env`-bestand, zoals de tabelnaam in de database, de gebruikersnaam van de omroeper en de debug-modus.

## Twitch-botclient

Een Twitch-botclient wordt gemaakt met behulp van `tmi.js` en geconfigureerd met de eerder gedefinieerde botconfiguratie.

## Functies voor berichtverwerking

Er zijn verschillende functies gedefinieerd voor berichtverwerking:

- `isMessageFromBroadcaster(tags)`: Controleert of een bericht afkomstig is van de omroeper.
- `writeToDebugFile(message)`: Schrijft debugging-informatie naar een logbestand, afhankelijk van de waarde van `DEBUG_MODE`.
- `checkUserInDatabase(username)`: Voert een databasequery uit om te controleren of een gebruikersnaam in de database aanwezig is.

## Bot-verbindingsgebeurtenis

Er is een gebeurtenis-handler gedefinieerd voor de `connected`-gebeurtenis van de botclient. Hier wordt een melding weergegeven en debug-informatie naar een bestand geschreven.

## Bot-chatberichtgebeurtenis

Er is een gebeurtenis-handler gedefinieerd voor de `message`-gebeurtenis van de botclient. Deze handler verwerkt chatberichten, inclusief commando's om gebruikersnamen te controleren.

- Het controleert of het bericht niet afkomstig is van de bot zelf (tenzij geconfigureerd om botberichten te controleren).
- Het controleert of het bericht afkomstig is van de omroeper en handelt dit speciaal af.
- Het herkent het `!checkusername`-commando en voert vervolgens de gebruikersnaamcontrole uit met behulp van de database.

## Functie voor het controleren van gebruikersnaam in de database

De functie `checkUserInDatabase(username)` wordt gebruikt om te controleren of een gebruikersnaam in de database aanwezig is. Deze functie maakt een verbinding met de database, voert een query uit en geeft een Promise terug.

## Bot-verbindingsstart

Tenslotte wordt de botclient verbonden met Twitch-chat met behulp van de `connect`-methode.

Dit is een algemene uitleg van de code. Raadpleeg de code en opmerkingen in de code voor meer specifieke details en implementatiedetails.
