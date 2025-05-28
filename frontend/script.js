const board_size = 10;
let gameID = null;
let usersTurn = true;

function renderBoard(boardElements, boardData, isCpuBoard){
    boardElements.innerHTML = ""; // removes existing content
    for (let y = 0; y < board_size; y++){
        for (let x = 0; x < board_size; x++){
            const cell = document.createElement("div"); // creating divs for each of the cells
            cell.classList.add('cell');
            const value = boardData[y][x];
            if (value  === "$" && !isCpuBoard) cell.classList.add("ship");
            if (value  === "Hit") cell.classList.add("hit");
            if (value  === "Miss") cell.classList.add("miss");
            if (isCpuBoard && usersTurn && value != "Hit" && value != "Miss"){
                cell.addEventListener("click", () => attack(x,y));
            }
            boardElements.appendChild(cell);
    }
}
}
function fetchState(){
    fetch(`http://localhost:3000/state?gameID=${gameID}`)
    .then(res => res.json())
    .then(data => {
        renderBoard(document.getElementById("userBoard"), data.userBoard, false);
        renderBoard(document.getElementById("cpuBoard"), data.cpuBoard, true);
        usersTurn = data.usersTurn;
        document.getElementById("status").textContent = data.status === "over" ? `Game Over, ${data.winner} Wins!` 
        : data.usersTurn ? "Your Turn" : "CPU's Turn";
    }
    )
    .catch(error => {
        console.error("error getting the game state", error);
    });
}

function attack(x,y){
    if (!usersTurn) return;
    fetch(`http://localhost:3000/attack`,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({gameID, x,y})
    })
    .then(res => res.json())
    .then(() => {
        fetchState(); //refresh
    })
    .catch(error => {
        console.error("error during attack", error)
    });
    }
window.onload = () => {
    fetch(`http://localhost:3000/newGame`,{method: "POST"})
    .then(res => res.json())
    .then(data => {
    gameID = data.gameID;
    
    const ships = [
        { coordinates: [[0, 0], [0, 1], [0, 2]]},
        { coordinates: [[2,0], [2,1]]},
        { coordinates: [[4,0], [4,1], [4,2], [4,3]]},
        { coordinates: [[0, 9], [1, 9], [2, 9]]},
        { coordinates: [[9, 9], [9, 8], [9, 7], [9, 6], [9, 5]]},
    ];
    
    fetch(`http://localhost:3000/placeShips`,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({gameID, ships})
    })
    .then(() => fetchState())
    .catch(console.error);
     });  
}
