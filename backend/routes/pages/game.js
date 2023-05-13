const express = require("express");
const Games = require("../../db/games");
const Chat = require("../../db/chat");

const requireToBeInGame = require("../../middleware/require-to-be-in-game");

const router = express.Router();

router.get("/create-game", (request, response) => {
  response.render("create-game", {
    title: "Create Game",
    ...request.session.user,
  });
});

router.get("/:id/start-game", requireToBeInGame, async (request, response) => {
  const { id: game_id } = request.params;
  const io = request.app.get("io");

  // check if game is already started, if it has, redirect to game page
  if (await Games.checkGameStarted(game_id)) {
    return response.redirect(`/games/${game_id}`);
  }

  // get array of canonical tiles
  const canonicalTiles = await Games.getCanonicalTiles();

  // get each player in the game and their ids
  const information = await Games.information(game_id);
  const players = information.players;

  // assign each 7 random canonical tiles, and insert into game_tiles
  const numberOfTilesPerPlayer = 7;
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < numberOfTilesPerPlayer; j++) {
      const randomIndexInCanonicalTiles = Math.floor(
        Math.random() * canonicalTiles.length
      );
      const randomCanonicalTile = canonicalTiles.splice(
        randomIndexInCanonicalTiles,
        1
      )[0];

      // insert into game_tiles
      await Games.insertIntoGameTiles(
        game_id,
        players[i].id,
        randomCanonicalTile.id,
        j,
        0
      );
    }
  }

  // insert the remaining canonical tiles into game_tiles (in the bag, which has user_id of -1)
  for (let i = 0; i < canonicalTiles.length; i++) {
    await Games.insertIntoGameTiles(game_id, -1, canonicalTiles[i].id, -1, -1);
  }

  // set started_at time in game
  await Games.setStartedAtTime(game_id);

  // emit to everyone in game room that the game has started
  io.sockets.in(game_id).emit("game-started");

  response.redirect(`/games/${game_id}`);
});

router.get(
  "/:id/waiting-room",
  requireToBeInGame,
  async (request, response) => {
    const { id: game_id } = request.params;

    // check if game is already started, if it has, redirect to game page
    if (await Games.checkGameStarted(game_id)) {
      return response.redirect(`/games/${game_id}`);
    }

    const { game_title, players: playersInGame } = await Games.information(
      game_id
    );

    response.render("waiting-room", {
      title: "Waiting Room",
      gameTitle: game_title,
      gameID: game_id,
      players: playersInGame,
      ...request.session.user,
    });
  }
);

router.get("/:id", requireToBeInGame, async (request, response) => {
  const { id: game_id } = request.params;

  // if game hasn't started yet, go to waiting-room
  if (!(await Games.checkGameStarted(game_id))) {
    return response.redirect(`/games/${game_id}/waiting-room`);
  }

  const board = await Games.getBoard();
  const chat = await Chat.getMessages(game_id);
  const gameTiles = await Games.getGameTiles(game_id);

  // get the players in the game and their scores
  const playersAndScores = await Games.playersAndScores(game_id);

  // get the player's tiles (tiles on their rack)
  let playerTiles = [];
  for (let i = 0; i < gameTiles.length; i++) {
    if (gameTiles[i].user_id === request.session.user.id) {
      playerTiles.push(gameTiles[i]);
    }
  }

  // get the tiles on the board of the game
  let boardTiles = [];
  for (let i = 0; i < gameTiles.length; i++) {
    if (gameTiles[i].user_id === 0) {
      boardTiles.push(gameTiles[i]);
    }
  }

  response.render("game", {
    title: "Term Project (Game)",
    gameID: game_id,
    board,
    messages: chat,
    playerTiles: playerTiles,
    boardTiles: boardTiles,
    playersAndScores: playersAndScores,
    ...request.session.user,
  });
});

module.exports = router;
