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
            if (value  === "SHIP" && !isCpuBoard) cell.classList.add("ship");
            if (value  === "HIT") cell.classList.add("hit");
            if (value  === "MISS") cell.classList.add("miss");
            if (isCpuBoard && usersTurn && value != "HIT" && value != "MISS"){
                cell.addEventListener("click", () => attack(x,y));
            }
            boardElements.appendChild(cell);
    }
}
}
function fetchState(){
    fetch(`http://localhost:300/state/${gameID}`)
    .then(res => res.json())
    .then(data => {
        renderBoard(document.getElementById("userBoard"), data.userBoard, false);
        renderBoard(document.getElementById("cpuBoard"), data.cpuBoard, true);
        usersTurn = data.usersTurn;
        document.getElementById("status").textContent = data.status === "over" ? `Game Over, ${data.winner} Wins!` 
        : data.usersTurn ? "Your Turn" : "CPU's Turn";
    }
    );
}

function attack(x,y){
    if (!usersTurn) return;
    fetch(`http://localhost:300/attack`,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({gameID, x,y})
    })
    .then(res => res.json())
    .then(() => {
        fetchState();
        setTimeout(() => {
            fetch(`http://localhost:300/cpu`,{
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({gameID})
        })
        .then(() => fetchState());
    }, 500);
    })
}

fetch(`http://localhost:300/newgame`,{method: "POST"})
.then(res => res.json())
.then(data => {
gameID = data.id;

const ships = [
    { coordinates: [[0, 0], [0, 1], [0, 2]]},
    { coordinates: [[2,0], [2,1]]},
    { coordinates: [[4,0], [4,1], [4,2], [4,3]]},
];
fetch(`http://localhost:300/placement`,{
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({gameID, ships})
})
.then(() => fetchState());

 });
