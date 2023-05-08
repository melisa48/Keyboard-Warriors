import io from "socket.io-client";
import events from "../backend/sockets/constants";
import { gameCreatedHandler } from "./games/created";
import getGameId from "../shared/get-game-id";
const game_id = getGameId(document.location.pathname);
const user_id = document.querySelector("#user").dataset.userId;
const board_tiles = JSON.parse(
  document.querySelector("#boardTiles").dataset.boardTiles
);
const socket = io({
  query: {
    roomID: game_id,
  },
});

socket.on("connect", () => {
  console.log("Connected with id: " + socket.id);
});

gameCreatedHandler(socket);

const messageContainer = document.querySelector("#messages");

socket.on(events.CHAT_MESSAGE_RECEIVED, ({ username, message, timestamp }) => {
  const entry = document.createElement("div");

  const displayName = document.createElement("span");
  displayName.innerText = username + " ";

  const displayMessage = document.createElement("span");
  displayMessage.innerText = message + " ";

  const displayTimestamp = document.createElement("span");
  displayTimestamp.innerText = timestamp;

  entry.append(displayName, displayMessage, displayTimestamp);

  messageContainer.appendChild(entry);
});

// game buttons
const gameButtonsContainer = document.getElementById("gameButtons");
const gameButtons = gameButtonsContainer.querySelectorAll("button");

const submitButton = gameButtonsContainer.querySelector("#submitButton");
submitButton.addEventListener("click", async () => {
  // get all board square divs with player tile children
  const boardSquares = document.querySelectorAll(".board-square");
  const boardSquaresWithPlayerTile = Array.from(boardSquares).filter(
    (boardSquare) => boardSquare.querySelector(".player-tile")
  );

  // array of objects that contains each tile and board position played by user
  let tilesPlayed = [];
  boardSquaresWithPlayerTile.forEach((boardSquareWithPlayerTile) => {
    const boardX = parseInt(boardSquareWithPlayerTile.getAttribute("x"));
    const boardY = parseInt(boardSquareWithPlayerTile.getAttribute("y"));

    const playerTile = boardSquareWithPlayerTile.querySelector(".player-tile");
    const canonicalTileID = parseInt(playerTile.getAttribute("id"));

    // TODO: Get letter on database side from canonical tile ID; this is just for
    // testing
    tilesPlayed.push({
      boardX: boardX,
      boardY: boardY,
      canonicalTileID: canonicalTileID,
      letter: playerTile.textContent,
    });
  });

  // take away the tiles from the board that were played? (if API request successful, if not
  // successful, don't remove)
  // since server will emit, and client will listen, will update the board accordingly
  // tiles emitted won't be draggable

  await fetch(`/api/games/${game_id}/submit-word`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tilesPlayed),
  })
    .then(() => {
      // remove played tiles from board
      boardSquaresWithPlayerTile.forEach((boardSquareWithPlayerTile) => {
        const playerTile =
          boardSquareWithPlayerTile.querySelector(".player-tile");
        boardSquareWithPlayerTile.removeChild(playerTile);
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

// gameButtons.forEach((button) => {
// button.addEventListener("click", async () => {
//   await fetch(`/api/games/${game_id}/submit-word`, {
//     method: "post",
//   }).catch((error) => {
//     console.log(error);
//   });
// });
// });

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

// put board tiles on board
for (let i = 0; i < board_tiles.length; i++) {
  const boardTile = board_tiles[i];
  placeTileOnBoard(
    boardTile.x,
    boardTile.y,
    boardTile.tile_id,
    boardTile.letter
  );
}

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

const playerTiles = document.getElementsByClassName("player-tile");

socket.on("current-player", (currentPlayer) => {
  // if user isn't current player:
  // make tiles not draggable
  // disable game buttons
  // if user is current player:
  // make tiles draggable
  // enable game buttons

  if (currentPlayer.user_id == user_id) {
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

document
  .querySelector("input#chatMessage")
  .addEventListener("keydown", (event) => {
    if (event.keyCode !== 13) {
      return;
    }

    const message = event.target.value;
    event.target.value = "";

    fetch(`/chat/${game_id}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  });
