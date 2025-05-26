const express = require('express');
const cors = require('cors');

const gameplay = require("./gamelogic");
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json);
const games = new Map(); // stores different games

app.post('/gamelogic', (req, res) => {
const game = new gameplay();
games.set(gameplay.id, gameplay); //saves game with ID
res.json(json({gameID: game.id})) 
});

app.post('./placeShips', (req, res) => {
    try{
        const {gameID, ships} = req.body;
        if (!games.has(gameID)) return res.status(404).json({error: "Game not Found"});
        const gameplay = games.get(gameID); // check if game exists
        gameplay.placeUserShips(ships);
        res.json({message: "Ships Placed", state: gameplay.stateofGame() }); // send to front
    }
    catch (error){
        res.status(400).json({error: error})
    }
    
});

app.post('/attack', (req, res) => {
    try{
        const { gameID, x, y} = req.body;
        if (!games.has(gameID)) return res.status(404).json({error: "Game not Found"});
        const gameplay = games.get(gameID);
        const hit = game.userAttack(x,y);
        const CPUAttack  = gameplay.CPUAttack;
        res.json({userHit: hit, cputAttack: cpuAttack, state: gameplay.stateofGame()})
    }
    catch (error){
        res.status(400).json({error: error})
    }
});

app.get('/state', (req, res) => {
const gameID = req.query.gameID;
if (!games.has(gameID)) return res.status(404).json({error: "Game not Found"});
const gameplay = games.get(gameID);
res.json(game.stateofGame()); // send it back
});

app.listen(PORT,() => {
    console.log(`backend running on http://localhost:${PORT}`); //starts the server
});
