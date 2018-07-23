# multiplayer-tictactoe

This game makes use of *Socket.IO* to create an online game that could be played by 2 players simultaneously, other clients that connect to the page will be allowed to spectate the game as it is being played.

This game was created quite a while back when I didn't have much knowledge on HTML, CSS, JavaScript. As a result, there isn't any separation of concerns; scripts are written within the HTML, the game has a few bugs etc.

The design of the tictactoe board and page is also quite plain, just using some primitive CSS and html buttons to make the design.

When I get better, I might take a look at the code and refactor it myself.

The list of things to do:
1. Rethink the CSS portion of the file
2. Use icons instead of "X" and "O"
..* Better yet, use some animations?
3. Resolve the problem where the board can still be clicked even when a winner is already announced
4. Instead of having spectators, multiple sessions of the game can be created,and games be served simultaneously.
