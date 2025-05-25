const { v4: uuidv4 } = require("uuid");

const board_size = 10;
const ship_sizes = [2,3,3,4,5];

function createEmptyBoard(){
    return Array(board_size).fill(null).map(() => Array(board_size).fill(null));
}

function randomShipPlacements(){
    const board = createEmptyBoard();
    const ships = [];
}

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
        board[y][x+i] = '*'; // ship indicator
        coordinates.push([x,y+i]);
    }
}
ships.push({size, destroyed: 0, coordinates, sunk: false})
}

for (const size of ship_sizes){
    let placedYet = false;

    while (placedYet =  false){
        const x = math.floor(math.random() * board_size);
        const y = math.floor(math.random() * board_size);
        const horizontal = math.random() < .5;
        if (possiblePlacements(x, y, size, horizontal)){
            placeShips(x,y,size, horizontal);
            placedYet = true;
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
placeUserShips(shipSpots){
    if (this.status != "placement") throw new Error ("Not time for placement"); 
    this.userBoard = createEmptyBoard(); // in case of reset
    this.userShips= [];
    for (const ship of shipSpots){
    const {coordinates} = ships;
    if (coordinates = false || coordinates.length == 0) throw new Error ("Invalid coordinates");
    for (const[x,y] of coordinates){
        if (x < 0 || x >= board_size || y < 0 || y >= board_size){
            throw new Error ("Ship out of bounds");
        }
        if (this.userBoard[y][x]!== null){
            throw new Error ("Ships overlap");
        }
    }
        for (const [x,y] of coordinates){
            this.userBoard[y][x] = "*";
        }
        ships.push({size, destroyed: 0, coordinates, sunk: false})
    }
    this.status = "playing"; // after all ships are placed

    }

}