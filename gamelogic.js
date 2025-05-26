const { v4: uuidv4 } = require("uuid");

const board_size = 10;
const ship_sizes = [2,3,3,4,5];

function createEmptyBoard(){
    return Array(board_size).fill(null).map(() => Array(board_size).fill(null));
}

function randomShipPlacements(){
    const board = createEmptyBoard();
    const ships = [];
function possiblePlacements(x,y, size, horizontal){
if (horizontal){
    if (x + size > board_size) return false; // too big
    for (let i = 0; i < size; i++){
        if (board[y][x+i]!= null) return false; // cell already taken
    }
}
else{
    if (y + size > board_size) return false; 
    for (let i = 0; i < size; i++){
        if (board[y+i][x]!= null) return false; 
    }
}
return true;
}

function placeShips(x,y, size, horizontal){
const coordinates = [];
for (let i = 0; i < size; i++){
    if (horizontal){
        board[y][x+i] = '$'; // ship indicator
        coordinates.push([x+i,y]);
    }
    else{
        board[y+i][x] = '$'; 
        coordinates.push([x,y+i]);
        }
       
    }
ships.push({size, hits: 0, coordinates, sunk: false})
}

for (const size of ship_sizes){
    let placedYet = false;

    while (!placedYet){
        const x = Math.floor(Math.random() * board_size);
        const y = Math.floor(Math.random() * board_size);
        const horizontal = Math.random() < .5;
        if (possiblePlacements(x, y, size, horizontal)){
            placeShips(x,y,size, horizontal);
            placedYet = true;
        }
    }    
}
return {board, ships};
}

class Game{
constructor(){
    this.id = uuidv4();
    //inital empty boards
    this.userBoard = createEmptyBoard(); 
    this.cpuBoard = createEmptyBoard();
    // boards with ships
    this.userShips = [];
    this.cpuShips = [];
    // ships destroyed
    this.userHits = [];
    this.cpuHits = [];
    // cpu ships (random)
    const cpuPlacement= randomShipPlacements();
    this.cpuBoard = cpuPlacement.board;
    this.cpuShips = cpuPlacement.ships;

    this.usersTurn = true;
    this.status = "placement";
    this.winner = null;
}
    placeUserShips(shipSpots) {
        if (this.status !== "placement") throw new Error("Not time for placement");
        this.userBoard = createEmptyBoard(); // reset board
        this.userShips = [];
        for (const ship of shipSpots) {
            const { coordinates } = ship;
            if (!coordinates || coordinates.length === 0) throw new Error("Invalid coordinates");
            for (const [x, y] of coordinates) {
                if (x < 0 || x >= board_size || y < 0 || y >= board_size) throw new Error("Ship out of bounds");
                if (this.userBoard[y][x] !== null) throw new Error("Ships overlap"); // cell already taken
            }
            for (const [x, y] of coordinates) {
                this.userBoard[y][x] = "$"; // indicates ship
            }
            this.userShips.push({ size: coordinates.length, hits: 0, coordinates, sunk: false });
        }
        this.status = "playing"; //after all ships are placed
    }
 userAttack(x,y){
    if (this.status!== "playing") throw new Error("Not Time to Play");
    if (!this.usersTurn) throw new Error("CPU's Turn");
    if (x < 0 || x >= board_size || y < 0 || y >= board_size) throw new Error ("out of bounds");
    if (this.userHits.some(([a,b]) => a === x && b === y)) throw new Error ("Previously Fired Here");
    this.userHits.push([x,y]);
    const hit = this.cpuBoard[y][x] === "$";
    if (hit){
        this.cpuBoard[y][x] = "Hit" //Hit the other ship
        this.hitShip(this.cpuShips, x,y);
    }
    else{
        this.cpuBoard[y][x] = "Miss" // Missed
    }
    // check for win
    if (this.cpuShips.every(ship => ship.sunk)){
        this.status = "over";
        this.winner = "user";
    }
    else{
        this.usersTurn = false;
    }
    return hit;
}
cpuAttack(){
    if (this.status!== "playing") throw new Error("Not Time to Play");
    if (this.usersTurn) throw new Error("Not CPU's Turn");
    let x,y;
    do {
        x = Math.floor(Math.random() *board_size);
        y = Math.floor(Math.random() *board_size);
    }
    while (this.cpuHits.some(([a,b]) => a === x && b === y));
    this.cpuHits.push([x,y]);
    const hit = this.userBoard[y][x] === "$";
    if (hit){
        this.userBoard[y][x] = "Hit" //Hit the other ship
        this.hitShip(this.userShips, x,y);
    }
    else{
        this.userBoard[y][x] = "Miss";
    }
     // check for win
     if (this.userShips.every(ship => ship.sunk)){
        this.status = "over";
        this.winner = "cpu";
    }
    else{
        this.usersTurn = true;
    }
    return [x,y,hit];
}
hitShip(ships, x,y){
    for (const ship of ships){
        for (const [a,b] of ship.coordinates){
            if (a ===x && b === y){
                ship.hits++;
                if (ship.hits >= ship.size){
                    ship.sunk = true;
                }
                return;
            }
        }
    }
}
stateofGame(){
    return{
        id: this.id,
        status: this.status,
        winner: this.winner,
        usersTurn: this.usersTurn,
        userBoard: this.userBoard,
        cpuBoard: this.cpuBoard.map(row => row.map(cell => cell === "$" ? null : cell)), // won't show the player the CPU ships
        userHits: this.userHits,
        cpuHits: this.cpuHits,
    };
}
}
module.exports = Game;