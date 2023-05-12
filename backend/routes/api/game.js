const express = require("express");
const Games = require("../../db/games");
const { GAME_CREATED } = require("../../../shared/constants");

const router = express.Router();

router.get("/list", async (request, response) => {
  const { id: user_id } = request.session.user;

  try {
    const games = await Games.list(user_id);

    response.json({ games });
  } catch (error) {
    console.log({ error });

    response.redirect("/lobby");
  }
});

router.post("/create", async (request, response) => {
  const { game_title, number_of_players } = request.body;
  const { id: user_id } = request.session.user;
  const io = request.app.get("io");

  try {
    const { game_id } = await Games.create(
      user_id,
      game_title,
      number_of_players
    );

    io.emit(GAME_CREATED, { game_id, game_title });

    response.redirect(`/games/${game_id}/waiting-room`);
  } catch (error) {
    console.log({ error });

    response.redirect("/lobby");
  }
});

router.get("/:id/join", async (request, response) => {
  const { id: game_id } = request.params;
  const { id: user_id } = request.session.user;

  try {
    await Games.join(user_id, game_id);

    response.redirect(`/games/${game_id}/waiting-room`);
  } catch (error) {
    console.log({ error });

    response.redirect("/lobby");
  }
});

// returns the tiles that were taken from the bag and given to the user
const giveTilesFromBagToUser = async (
  userID,
  gameID,
  numberOfTilesRequested
) => {
  // numberOfTilesInBag = number of tiles in the bag
  const numberOfTilesInBag = await Games.getNumberOfTilesInBag(gameID);

  // if numberOfTilesRequested > numberOfTilesInBag, return getTilesFromBag(userID, gameID, numberOfTilesInBag)
  if (numberOfTilesRequested > numberOfTilesInBag) {
    return giveTilesFromBagToUser(userId, gameID, numberOfTilesInBag);
  }

  // SQL queries:
  // 1) get numberOfTilesRequested random tile_ids where game_id = gameID & user_id=-1
  // 2) set user_id = userID for game_id = gameID & tile_id IN (1), returning *
  // return output of 2nd SQL query
  return await Games.giveTilesFromBagToUser(
    userID,
    gameID,
    numberOfTilesRequested
  );
};

// returns true if user has all of the tiles on their rack; false otherwise
// expects tiles to be an array of objects, and idAttribute to be the attribute
// of each object being the key of the tile ID
const ensureUserHasTiles = async (userID, gameID, tiles, idAttribute) => {
  for (let i = 0; i < tiles.length; i++) {
    const tile_id = tiles[i][idAttribute];
    const userHasTile = await Games.checkUserHasTile(userID, gameID, tile_id);
    if (!userHasTile) {
      return false;
    }
  }

  return true;
};

const ensureUserInGame = async (userID, gameID) => {
  const playerInGame = await Games.playerInGame(userID, gameID);
  return playerInGame[0].exists;
};

const ensureUserCanMakeTurn = async (userID, gameID) => {
  const userCanMakeTurn = await Games.userCanMakeTurn(userID, gameID);
  return userCanMakeTurn[0].exists;
};

router.post("/:id/submit-word", async (request, response) => {
  const { id: game_id } = request.params;
  const { id: user_id } = request.session.user;
  const io = request.app.get("io");

  const tilesPlayed = request.body;

  try {
    // ensure player is in the game
    const userInGame = await ensureUserInGame(user_id, game_id);
    if (!userInGame) {
      throw new Error("User not in game!");
    }

    // check if the player can make a turn
    const userCanMakeTurn = await ensureUserCanMakeTurn(user_id, game_id);
    if (!userCanMakeTurn) {
      throw new Error("User can't make turn!");
    }

    // ensure user has the tiles that were played
    const userHasTiles = await ensureUserHasTiles(
      user_id,
      game_id,
      tilesPlayed,
      "canonicalTileID"
    );
    if (!userHasTiles) {
      throw new Error("User doesn't have the tiles!");
    }

    // TODO: ensure board positions aren't taken already

    // TODO: check that tiles comply with Scrabble rules

    // update game tiles table with each tile placed &
    // update user's score in game_users
    for (const tilePlayed of tilesPlayed) {
      // user_id is 0 as it is placed on the board
      await Games.updateGameTiles(
        game_id,
        0,
        tilePlayed.canonicalTileID,
        tilePlayed.boardX,
        tilePlayed.boardY
      );

      // update the user's score with each tile's point value
      await Games.updateUserScoreInGame(
        game_id,
        user_id,
        tilePlayed.canonicalTileID
      );
    }

    // emit the player's id and their new score to the room
    const newPlayerScore = await Games.getUserScoreInGame(game_id, user_id);
    io.sockets.in(game_id).emit("player-score-updated", newPlayerScore);

    // get and set new current player & emit to room
    const newCurrentPlayer = await Games.setAndGetNewCurrentPlayer(game_id);
    io.sockets.in(game_id).emit("current-player", newCurrentPlayer);

    // emit the added tiles to the room
    io.sockets.in(game_id).emit("board-updated", tilesPlayed);

    // give new tiles to the player
    const newTilesForUser = await giveTilesFromBagToUser(
      user_id,
      game_id,
      tilesPlayed.length
    );

    response.status(200).send(newTilesForUser);
  } catch (error) {
    console.log(error);
    response.status(500);
  }
});

module.exports = router;
