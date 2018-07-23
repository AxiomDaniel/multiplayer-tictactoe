var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var count = 0;      //Keeps track of how many players are playing (not including waiting list. max is 2)  
var vacantXO = true;    //Value to assign when players enter the game, true for X, false for O
var waitingList = [];   //Keeps a list of users that are on the waiting list.
var isXTurn = true;     //Keeps track of the current turn. True means X's turn.
var boardOccupancy = ['', '', '', '', '', '', '', '', ''];  //Keeps track of the game board

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

io.on('connection', (socket)=> {
    if (count < 2) {                    //Tic Tac Toe board is currently vacant
        socket.emit('isXO', vacantXO);  //Emits to client about its position(i.e. X/O)
        count++;
        vacantXO = !vacantXO;
    } else {                            //Game already has two players now.
        socket.emit('preWaitingList');  //Initialize process to put current player into waiting list
    };
    var user = {    //Variable to identify each client by their ID and stores they position(i.e. X/O)
        id: null,
        isPlayerX: null,
    };

    socket.on('newPlayer', (id,isX) => {    //Server receives client information and proceeds to update variable user accordingly
        user.id = id
        user.isPlayerX = isX
        console.log(user.id + " is currently playing. Player is " + user.isPlayerX);
    });   

    socket.on('disconnect', () => {         //Server receives information that client has disconnected
        console.log(user.id + " has disconnected.");
        if (user.isPlayerX === true || user.isPlayerX == false) {   //Only players can reset game board
            resetGame(boardOccupancy,isXTurn);  //Proceed to reset game board
            io.emit('serverUpdateMove', boardOccupancy);
            if (waitingList.length > 0) {       //If there is a player in the waiting list, initialize it as a player.
                io.emit('initializeNewPlayer', waitingList.shift(), user.isPlayerX);
            } else {                            //Else, prime server to wait for a new player
                count--;
                vacantXO = user.isPlayerX;      //Set the vacant position to the player who just disconnected
            };
        } else {    //Spectators that leave gets removed from the waiting list
            console.log(waitingList);
            var index;
            for (var i = 0; i < waitingList.length; i++) {
                if (user.id === waitingList[i].id) {
                    var index = i;
                };
            };
            if (index > -1) {
                waitingList.splice(index, 1);
            };
        };
    });

    socket.on('clientClickButton', (num, isX) => {  //When client clicks a square on game board, client posts square number and its position(true/false for X/O)
        if (isX !== isXTurn) {  //Checks if client's position is not game's current turn
            socket.emit("notYourTurn");
        } else if (boardOccupancy[num] !== '') {    //Check if the square clicked is already occupied.
            socket.emit("blockOccupied");
        } else {        //Move made is legal
            boardOccupancy[num] = isX ? "X" : "O";  //Updates the game board in server side
            io.emit('serverUpdateMove', boardOccupancy);    //Emit the updated board to everyone
            socket.broadcast.emit("yourTurn");
            isXTurn = !isXTurn;
            var winnerFound = calculateWinner(boardOccupancy); //Calculates game's win condition
            if (winnerFound !== -1) {
                io.emit('winner', winnerFound);     //Alert all players if win condition is met
                console.log("Winner Found");
            };
        }
    });

    socket.on('clientResetButton', () => {      //Server logic when client presses 'reset'
        if (user.isPlayerX === true || user.isPlayerX == false) {   //Checks if client is an actual player. Spectators can't reset games
            resetGame(boardOccupancy,isXTurn);
            io.emit('serverUpdateMove', boardOccupancy);
        } else {
            socket.emit('notYourTurn');     //If spectator presses reset, emit notYourTurn.
        };
    });

    socket.on('waitingList', (id) => {      //Client has posted ID to server. Update respective user variable and push into waitingList
        user.id = id;
        waitingList.push(user);
        socket.emit("postWaitingList", waitingList.length);
    });
});

function resetGame(gameBoard, XTurn) {     //Function to reset game board
    isXTurn = true;     //In game, X always goes first
    for (var i = 0; i < 9; i++) {
        gameBoard[i] = '';
    };
};

//Referenced from: https://reactjs.org/tutorial/tutorial.html and modified for self use.
function calculateWinner(squares) {     //Function to calculate win condition for game.
    const lines = [     //All possible permutations of win based on board's indices
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {    //Check for each win condition if it has been fulfilled. 
      const [a, b, c] = lines[i];
      if (squares[a] !== '' && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] === 'X' ? "X has won" : "O has won" ;
      }
    }
    return -1;
  }

http.listen(3000, () => console.log("Listening on port 3000"));