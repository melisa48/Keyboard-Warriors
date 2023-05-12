const express = require("express");
const Games = require("../../db/games");
const { GAME_CREATED } = require("../../../shared/constants");

const router = express.Router();

const scrabbleWords = require("../../scrabbleWords");

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

// returns h if horizontal, v if vertical, n if none
const getWordDirection = (tilesPlayed) => {
  const minRow = tilesPlayed.reduce((previous, current) => {
    return previous.boardX < current.boardX ? previous : current;
  }).boardX;

  const maxRow = tilesPlayed.reduce((previous, current) => {
    return previous.boardX > current.boardX ? previous : current;
  }).boardX;

  const minCol = tilesPlayed.reduce((previous, current) => {
    return previous.boardY < current.boardY ? previous : current;
  }).boardY;

  const maxCol = tilesPlayed.reduce((previous, current) => {
    return previous.boardY > current.boardY ? previous : current;
  }).boardY;

  // based on min and max values, determine direction of word
  if (minRow == maxRow) {
    return { direction: "h", minCol: minCol, maxCol: maxCol, wordRow: minRow };
  } else if (minCol == maxCol) {
    return { direction: "v", minRow: minRow, maxRow: maxRow, wordCol: minCol };
  } else {
    return { direction: "n" };
  }
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

    let touchesExistingTile;
    // if first word not placed on board, set touchesExistingTile to true
    const firstWordPlaced = await Games.firstWordPlacedInGame(game_id);
    if (firstWordPlaced) {
      touchesExistingTile = false;
    } else {
      touchesExistingTile = true;
    }

    // TODO: check that tiles comply with Scrabble rules

    // checks that tile positions aren't taken already, and that the
    // tiles touch at least one existing tile on the board
    for (const tilePlayed of tilesPlayed) {
      // ensure board position of tile isn't taken already
      const positionTaken = await Games.tileOnBoardAlready(
        game_id,
        tilePlayed.boardX,
        tilePlayed.boardY
      );
      if (positionTaken) {
        throw new Error("Board position of tile taken already!");
      }

      // check if current tile touches existing tile, if none of previous tiles touched existing tiles
      if (!touchesExistingTile) {
        const leftCheck = await Games.tileOnBoardAlready(
          game_id,
          tilePlayed.boardX,
          tilePlayed.boardY - 1
        );
        const upCheck = await Games.tileOnBoardAlready(
          game_id,
          tilePlayed.boardX - 1,
          tilePlayed.boardY
        );
        const rightCheck = await Games.tileOnBoardAlready(
          game_id,
          tilePlayed.boardX,
          tilePlayed.boardY + 1
        );
        const downCheck = await Games.tileOnBoardAlready(
          game_id,
          tilePlayed.boardX + 1,
          tilePlayed.boardY
        );

        if (leftCheck || upCheck || rightCheck || downCheck) {
          // set to true to prevent doing check for a later tile
          touchesExistingTile = true;
        }
      }
    }

    // if every tile in word placed doesn't touch existing tile
    if (!touchesExistingTile) {
      throw new Error("Word doesn't touch existing tiles!");
    }

    // v if vertical, h if horizontal, n if none
    const wordDirection = getWordDirection(tilesPlayed);

    // word is neither in the horizontal or vertical direction
    if (wordDirection.direction == "n") {
      throw new Error("Word must be in the horizontal or vertical direction!");
    }

    // ensure that no gaps present in word; build word to eventually determine if it is valid
    let word = "";
    if (wordDirection.direction == "h") {
      // TODO: Check the left of the first tile for any board tiles

      // there must be a tile in each column represented by i; if no tile in either
      // tilesPlayed or DB, fail
      for (let i = wordDirection.minCol; i <= wordDirection.maxCol; i++) {
        // check in tilesPlayed & DB for the tile
        const tilePlayedResult = tilesPlayed.find(
          (tilePlayed) => tilePlayed.boardY == i
        );
        const dbResult = await Games.tileOnBoardAlready(
          game_id,
          wordDirection.wordRow,
          i
        );
        if (tilePlayedResult == undefined && !dbResult) {
          throw new Error(
            "Word isn't continuous along the horizontal direction!"
          );
        } else if (tilePlayedResult != undefined) {
          word += tilePlayedResult.letter;
        } else {
          // get tile from DB
          const tileLetter = await Games.getTileOnGameBoard(
            game_id,
            wordDirection.wordRow,
            i
          );
          word += tileLetter;
        }
      }
    } else if (wordDirection.direction == "v") {
      // TODO: Check above the first tile for any board tiles

      // there must be a tile in each row represented by i; if no tile in either
      // tilesPlayed or DB, fail
      for (let i = wordDirection.minRow; i <= wordDirection.maxRow; i++) {
        // check in tilesPlayed & DB for the tile
        const tilePlayedResult = tilesPlayed.find(
          (tilePlayed) => tilePlayed.boardX == i
        );
        const dbResult = await Games.tileOnBoardAlready(
          game_id,
          i,
          wordDirection.wordCol
        );

        if (tilePlayedResult == undefined && !dbResult) {
          throw new Error(
            "Word isn't continuous along the vertical direction!"
          );
        } else if (tilePlayedResult != undefined) {
          word += tilePlayedResult.letter;
        } else {
          // get tile from DB
          const tileLetter = await Games.getTileOnGameBoard(
            game_id,
            i,
            wordDirection.wordCol
          );
          word += tileLetter;
        }
      }
    }

    // check if word is valid
    console.log(`Word: ${word}`);
    if (!scrabbleWords.has(word)) {
      throw new Error(`${word} isn't a valid word.`);
    }

    // if first word placed is false in DB, set to true
    if (!firstWordPlaced) {
      await Games.setFirstWordPlacedToTrue(game_id);
    }

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
    response.status(500).json({ message: error.message });
  }
});

module.exports = router;
