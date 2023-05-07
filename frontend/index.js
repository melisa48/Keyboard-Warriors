import io from "socket.io-client";
import events from "../backend/sockets/constants";
import { gameCreatedHandler } from "./games/created";
import getGameId from "../shared/get-game-id";
const game_id = getGameId(document.location.pathname);
const user_id = document.querySelector("#user").dataset.userId;
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
const gameButtonsContainer = document.querySelector("#gameButtons");
const gameButtons = gameButtonsContainer.querySelectorAll("button");

gameButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await fetch(`/api/games/${game_id}/submit-word`, {
      method: "post",
    }).catch((error) => {
      console.log(error);
    });
  });
});

socket.on("current-player", (currentPlayer) => {
  console.log(currentPlayer);

  // disable game buttons if the user isn't the current player, enable them if they are
  if (currentPlayer.user_id == user_id) {
    gameButtons.forEach((button) => {
      button.disabled = false;
    });
  } else {
    gameButtons.forEach((button) => {
      button.disabled = true;
    });
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
