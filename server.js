const express = require('express');
const cors = require('cors');
const path = require('path');
const Game = require("./gamelogic");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
const PORT = 3000;
const games = new Map(); // stores different games

app.post('/newGame', (req, res) => {
const game = new Game();
games.set(game.id, game); //saves game with ID
res.json({gameID: game.id})
});

app.post('/placeShips', (req, res) => {
    try{
        const {gameID, ships} = req.body;
        if (!games.has(gameID)) return res.status(404).json({error: "Game not Found"});
        const game = games.get(gameID); // check if game exists
        game.placeUserShips(ships);
        res.json({message: "Ships Placed", state: game.stateofGame() }); // send to front
    }
    catch (error){
        res.status(400).json({error: error.message})
    }
    
});

app.post('/attack', (req, res) => {
    try{
        const { gameID, x, y} = req.body;
        if (!games.has(gameID)) return res.status(404).json({error: "Game not Found"});
        const game = games.get(gameID);
        const hit = game.userAttack(x,y);
        const cpuAttack  = game.cpuAttack();
        res.json({userHit: hit, cpuAttack: cpuAttack, state: game.stateofGame()})
    }
    catch (error){
        res.status(400).json({error: error.message})
    }
});

app.get('/state', (req, res) => {
const gameID = req.query.gameID;
if (!games.has(gameID)) return res.status(404).json({error: "Game not Found"});
const game = games.get(gameID);
res.json(game.stateofGame()); // send it back
});

app.listen(PORT,() => {
    console.log(`backend running on http://localhost:${PORT}`); //starts the server
});
 