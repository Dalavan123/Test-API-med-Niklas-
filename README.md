I index.js filen kommer vi att skapa vår server.
Innan vi börjar npm init -y (-y för att slippa svara ja hela tiden.)
Då har vi skapat ett node projekt och få package.json filen för att hämta hem paket
nmp install express
nu har vi fått node modules
npm install better-sqlite3 (för att kunna prata med databasen )
touch .gitignore (touch kommandot skapar en fil) Touch funkar bara i en bash terminal, zsh är också en bashterminal
skriv in node_modules
Nu ska vi skapa en server.
//här importerar vi in express
const express = require('express');
//här skapar vi våran app. Nu finns serverfunktionaliteten finns i app-variabeln
const app = express();
Nodemon har installerats globalt

Testa i Postman:
Postman: http://localhost:3001/

Nu ska vi lägga till databasen.db
Kopiera in den i mappen i utforskaren, då ska den dyka upp i VS-code

Nu ska vi skapa lite filer:
customer.controller.js
Detta för vi vill inte ha allt i samma fil
