import socket from "./common_utilities/socket";
import getGameId from "../shared/get-game-id";
import { chatItemCreatedHandler } from "./common_utilities/chat";
import { configureSubmitButton } from "./games/submit";

const gameID = getGameId(document.location.pathname);
const userID = document.querySelector("#user").dataset.userId;
const boardTiles = JSON.parse(
  document.querySelector("#boardTiles").dataset.boardTiles
);
const playerTiles = document.getElementsByClassName("player-tile");

// game buttons
const gameButtonsContainer = document.getElementById("gameButtons");
const gameButtons = gameButtonsContainer.querySelectorAll("button");

chatItemCreatedHandler(socket);
configureSubmitButton(gameButtonsContainer, gameID);

function placeTileOnBoard(x, y, id, letter) {
  const boardSquare = document.querySelector(
    `.board-square[x="${x}"][y="${y}"]`
  );

  const tileDiv = document.createElement("div");
  tileDiv.id = id;
  tileDiv.classList += "square no-drop";
  tileDiv.style = "background-color: #E1B995;";
  tileDiv.textContent = letter;

  boardSquare.appendChild(tileDiv);
}

// put board tiles on board, on page load
for (let i = 0; i < boardTiles.length; i++) {
  const boardTile = boardTiles[i];
  placeTileOnBoard(
    boardTile.x,
    boardTile.y,
    boardTile.tile_id,
    boardTile.letter
  );
}

// places tiles on board when others submitted a word
socket.on("board-updated", (newTiles) => {
  for (let i = 0; i < newTiles.length; i++) {
    const newTile = newTiles[i];
    placeTileOnBoard(
      newTile.boardX,
      newTile.boardY,
      newTile.canonicalTileID,
      newTile.letter
    );
  }
});

// enable/disable parts of game depending on if user is the current player or not
socket.on("current-player", (currentPlayer) => {
  // if user isn't current player:
  // make tiles not draggable
  // disable game buttons
  // if user is current player:
  // make tiles draggable
  // enable game buttons

  if (parseInt(currentPlayer.user_id) == userID) {
    // user is current player

    gameButtons.forEach((button) => {
      button.disabled = false;
    });

    for (let i = 0; i < playerTiles.length; i++) {
      playerTiles[i].setAttribute("draggable", true);
    }
  } else {
    // user isn't current player

    gameButtons.forEach((button) => {
      button.disabled = true;
    });

    for (let i = 0; i < playerTiles.length; i++) {
      playerTiles[i].setAttribute("draggable", false);
    }
  }
});

socket.on("player-score-updated", (newPlayerScore) => {
  const playerDiv = document.querySelector(".player-" + newPlayerScore.user_id);
  const scoreDiv = playerDiv.querySelector(".score");
  scoreDiv.textContent = newPlayerScore.score;
});

// Resign Functionality 
async function resign() {
    try {
        const response = await axios.put(`/api/games/${gameId}/resign`, {
            userId: userId
        });
        if (response.status === 200) {
            console.log(response.data.message);
            // Update game state
            // ...
        } else {
            console.log(response.data.message);
        }
    } catch (error) {
        console.error(error);
    }
 }
 
 // Call resign function when resign button is clicked
 // ...
  
 
 