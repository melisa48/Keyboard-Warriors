import { GAME_CREATED } from "../../shared/constants";

const gameList = document.querySelector("#games-list");
const itemTemplate = document.querySelector("#available-game-item");

export function createGameListItem(game_id, game_title) {
  const entry = itemTemplate.content.cloneNode(true);

  entry
    .querySelector("button")
    .setAttribute(
      "onclick",
      `window.location.href='/api/games/${game_id}/join'`
    );
  entry.querySelector("span").innerText = game_title;

  return entry;
}

export function gameCreatedHandler(socket) {
  socket.on(GAME_CREATED, ({ game_id, game_title }) => {
    gameList.appendChild(createGameListItem(game_id, game_title));
  });
}
