const boardSize = 10;
const shipSizes = [2, 3, 3, 4, 5];  //standard battleship ship sizes

let userBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
let ships = []; // coordinates
let selectedIndex = null;

function initShips() {
  ships = [];
  let xStart = 0;
  let yStart = 0;
  for (const size of shipSizes) {
    const coords = []; // all horizontal at beginning
    for (let i = 0; i < size; i++) {
      coords.push([xStart + i, yStart]);
    }
    ships.push({ size, coordinates: coords });
    yStart += 2; // all vertical
  }
  updateBoard(); 
}

function updateBoard() { // with ships in new spots
  userBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  
  for (const [index, ship] of ships.entries()) {
    for (const [x, y] of ship.coordinates) {
      userBoard[y][x] = index; 
    }
  }
  
  const boardDiv = document.getElementById("userBoard");
  boardDiv.innerHTML = "";
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      const shipIndex = userBoard[y][x];
      if (shipIndex !== null) { // ensuring the cell is empty
        cell.classList.add("ship");
        if (shipIndex === selectedIndex) {
          cell.classList.add("selected");
        }
      }
      cell.dataset.x = x; // for clicking
      cell.dataset.y = y;
      boardDiv.appendChild(cell);
    }
  }
}

function isValidPlacement(coords, ignoreShipIndex = null) {
  for (const [x, y] of coords) {
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return false;
  }
  const bufferZone = [
    [-1, -1], [0, -1], [1, -1],[-1,  0],[1,  0],[-1,  1], [0,  1], [1,  1],];
  
  const newShipSpot = new Set(); // track the new ship & buffer zone
  for (const [x, y] of coords) {
    newShipSpot.add(`${x},${y}`);
    for (const [dx, dy] of bufferZone) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        newShipSpot.add(`${nx},${ny}`); // buffer
      }
    }
  }
  
  for (const [i, ship] of ships.entries()) {
    if (i === ignoreShipIndex) continue; // skip the ship we're moving
    
    for (const [x, y] of ship.coordinates) {
      if (newShipSpot.has(`${x},${y}`)) {
        return false; // ships touch/overlapping
      }
    }
  }
  return true; // no touching / overlapping
}

function moveSelectedShip(dx, dy) { // self explanatory
  if (selectedIndex === null) return; // no ship selected
  
  const ship = ships[selectedIndex];
  const newCoords = ship.coordinates.map(([x, y]) => [x + dx, y + dy]);
  
  if (isValidPlacement(newCoords, selectedIndex)) {
    ship.coordinates = newCoords;
    updateBoard();
  }
}

function selectShip(x, y) { // find selected
  for (const [index, ship] of ships.entries()) {
    if (ship.coordinates.some(([sx, sy]) => sx === x && sy === y)) {
      selectedIndex = index;
      updateBoard();
      return;
    }
  }
  selectedIndex = null; // empty
  updateBoard(); // deselect
}

function sendtoBack() {
  return ships.map(ship => ({
    coordinates: ship.coordinates
  }));
}

document.getElementById("userBoard").addEventListener("click", e => {
  if (!e.target.classList.contains("cell")) return; // only for cells
  const x = parseInt(e.target.dataset.x, 10);
  const y = parseInt(e.target.dataset.y, 10);
  selectShip(x, y);
});

window.addEventListener("keydown", e => { // move ships w/ keyboard
  if (selectedIndex === null) return;
  switch(e.key) {
    case "ArrowLeft":
      e.preventDefault();
      moveSelectedShip(-1, 0);
      break;
    case "ArrowRight":
      e.preventDefault();
      moveSelectedShip(1, 0);
      break;
    case "ArrowUp":
      e.preventDefault();
      moveSelectedShip(0, -1);
      break;
    case "ArrowDown":
      e.preventDefault();
      moveSelectedShip(0, 1);
      break;
  }
});

document.getElementById("startGame").addEventListener("click", async () => {
  if (ships.length !== shipSizes.length) {
    alert("Error: not all ships placed!");
    return;
  }
  
  try {
    const response = await fetch("/placeShips", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        gameID: currentGameID,  
        ships: sendtoBack(),
      }),
    });
    const data = await response.json();
    if (data.error) {
      alert("Error placing ships: " + data.error);
    } else {
      alert("Ships placed! Game state: " + JSON.stringify(data.state));
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
});

let currentGameID = null;

async function startNewGame() {
  try {
    const res = await fetch("/newGame", { method: "POST" }); // new game request
    const data = await res.json();
    currentGameID = data.gameID;
    initShips();
  } catch (err) {
    alert("Failed to start game: " + err.message);
  }
}

startNewGame();



