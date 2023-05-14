const express = require("express");
const Board = require("../../db/board");
const Games = require("../../db/games");
const GameUsers = require("../../db/game_users");
const Chat = require("../../db/chat");
const CanonicalTiles = require("../../db/canonical_tiles");
const GameTiles = require("../../db/game_tiles");

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
  const canonicalTiles = await CanonicalTiles.getCanonicalTiles();

  // get each player in the game and their ids
  const playersInGame = await GameUsers.playersInGame(game_id);

  // assign each 7 random canonical tiles, and insert into game_tiles
  const numberOfTilesPerPlayer = 7;
  for (let i = 0; i < playersInGame.length; i++) {
    for (let j = 0; j < numberOfTilesPerPlayer; j++) {
      const randomIndexInCanonicalTiles = Math.floor(
        Math.random() * canonicalTiles.length
      );
      const randomCanonicalTile = canonicalTiles.splice(
        randomIndexInCanonicalTiles,
        1
      )[0];

      // insert into game_tiles
      await GameTiles.insertIntoGameTiles(
        game_id,
        playersInGame[i].id,
        randomCanonicalTile.id,
        j,
        0
      );
    }
  }

  // insert the remaining canonical tiles into game_tiles (in the bag, which has user_id of -1)
  for (let i = 0; i < canonicalTiles.length; i++) {
    await GameTiles.insertIntoGameTiles(
      game_id,
      -1,
      canonicalTiles[i].id,
      -1,
      -1
    );
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

    const gameTitle = (await Games.gameInformation(game_id)).title;
    const playersInGame = await GameUsers.playersInGame(game_id);

    response.render("waiting-room", {
      title: "Waiting Room",
      gameTitle: gameTitle,
      gameID: game_id,
      players: playersInGame,
      ...request.session.user,
    });
  }
);

router.get("/:id/game-end", requireToBeInGame, async (request, response) => {
  const { id: game_id } = request.params;

  // if game hasn't ended yet, go to waiting-room
  if (!(await Games.gameInformation(game_id)).game_ended) {
    return response.redirect(`/games/${game_id}/waiting-room`);
  }

  // get the players in the game and their scores
  const playersAndScores = await GameUsers.playersAndScores(game_id);

  response.render("game-end", {
    title: "Game Ended",
    gameID: game_id,
    playersAndScores: playersAndScores,
    ...request.session.user,
  });
});

router.get("/:id", requireToBeInGame, async (request, response) => {
  const { id: game_id } = request.params;

  // if game hasn't started yet, go to waiting-room
  if (!(await Games.checkGameStarted(game_id))) {
    return response.redirect(`/games/${game_id}/waiting-room`);
  }

  // if game has ended, go to game-end
  if ((await Games.gameInformation(game_id)).game_ended) {
    return response.redirect(`/games/${game_id}/game-end`);
  }

  const board = await Board.getBoard();
  const chat = await Chat.getMessages(game_id);
  const gameTiles = await GameTiles.getGameTilesOfGame(game_id);

  // get the players in the game and their scores
  const playersAndScores = await GameUsers.playersAndScores(game_id);

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
