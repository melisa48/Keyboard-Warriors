import socket from "./common_utilities/socket";
import getGameId from "../shared/get-game-id";

const gameID = getGameId(document.location.pathname);

socket.on("joined-waiting-list", (username) => {
  const playersList = document.getElementById("players-list");
  const liElement = document.createElement("li");
  const spanElement = document.createElement("span");
  spanElement.classList += "player-username";
  spanElement.textContent = username;
  liElement.appendChild(spanElement);
  playersList.appendChild(liElement);
});

socket.on("game-started", () => {
  window.location.pathname = "/games/" + gameID;
});
