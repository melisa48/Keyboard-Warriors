const db = require("./connection");

const CREATE_GAME_SQL =
  "INSERT INTO games (title, player_count) VALUES ($1, $2) RETURNING id, created_at";

const INSERT_USER_IN_GAME_SQL =
  "INSERT INTO game_users (game_id, user_id, current, play_order) VALUES ($1, $2, $3, $4)";

const GAMES_LIST_SQL = `
  SELECT g.id, g.title, g.created_at FROM games g WHERE g.id NOT IN
    (SELECT gu.game_id FROM game_users gu WHERE gu.user_id = $1) AND
  (SELECT COUNT(*) FROM game_users WHERE game_users.game_id=g.id) < g.player_count`;

const NUMBER_OF_PLAYERS_IN_GAME_SQL =
  "SELECT COUNT(*) FROM game_users WHERE game_id = $1";

const GAME_TITLE_SQL = `SELECT title FROM games WHERE id=$1`;

const PLAYERS_IN_GAME_SQL = `SELECT u.id, u.username FROM users u WHERE u.id IN 
  (SELECT gu.user_id FROM game_users gu WHERE gu.game_id = $1)`;

const GAMES_USER_IS_IN_SQL = `SELECT gu.game_id, g.title FROM game_users gu, games g
  WHERE gu.game_id = g.id AND gu.user_id=$1`;

const CHECK_USER_IN_GAME_SQL = `SELECT EXISTS(SELECT 1 FROM game_users gu WHERE user_id=$1 AND game_id=$2)`;

const GAME_BOARD_SQL = `SELECT * FROM board;`;

const CANONICAL_TILES_SQL = `SELECT * FROM canonical_tiles;`;

const INSERT_TILE_IN_GAME_TILES = `INSERT INTO game_tiles (game_id, user_id, tile_id, x, y) VALUES ($1, $2, $3, $4, $5)`;

const GET_GAME_TILES_OF_GAME_SQL = `SELECT * FROM game_tiles gt, canonical_tiles ct WHERE gt.game_id=$1 AND gt.tile_id = ct.id`;

const GET_CURRENT_PLAYER_OF_GAME_SQL = `SELECT gu.user_id FROM game_users gu WHERE gu.game_id=$1 AND current=true`;

const list = async (user_id) => db.any(GAMES_LIST_SQL, [user_id]);

const games_user_is_in = async (user_id) => {
  return db.any(GAMES_USER_IS_IN_SQL, [user_id]);
};

const check_user_in_game = async (user_id, game_id) => {
  const result = await db.oneOrNone(CHECK_USER_IN_GAME_SQL, [user_id, game_id]);
  return result.exists;
};

const create = async (user_id, game_title, number_of_players) => {
  const { id: game_id } = await db.one(CREATE_GAME_SQL, [
    game_title,
    number_of_players,
  ]);

  await db.none(INSERT_USER_IN_GAME_SQL, [game_id, user_id, true, 1]);

  return { game_id };
};

const join = async (user_id, game_id) => {
  const { count: numberOfPlayers } = await db.one(
    NUMBER_OF_PLAYERS_IN_GAME_SQL,
    [game_id]
  );

  db.none(INSERT_USER_IN_GAME_SQL, [
    game_id,
    user_id,
    false,
    parseInt(numberOfPlayers) + 1,
  ]);
};

const information = async (game_id) => {
  const { title: game_title } = await db.one(GAME_TITLE_SQL, [game_id]);
  const players = await db.any(PLAYERS_IN_GAME_SQL, [game_id]);

  return { game_title, players };
};

const getBoard = async () => {
  return await db.any(GAME_BOARD_SQL);
};

const getCanonicalTiles = async () => {
  return await db.any(CANONICAL_TILES_SQL);
};

const insertIntoGameTiles = async (game_id, user_id, tile_id, x, y) => {
  await db.none(INSERT_TILE_IN_GAME_TILES, [game_id, user_id, tile_id, x, y]);
};

const getGameTiles = async (game_id) => {
  return await db.any(GET_GAME_TILES_OF_GAME_SQL, game_id);
};

const getCurrentPlayerOfGame = async (game_id) => {
  return await db.one(GET_CURRENT_PLAYER_OF_GAME_SQL, [game_id]);
};

const GET_CURRENT_PLAYER_PLAY_ORDER_SQL = `SELECT gu.play_order FROM game_users gu WHERE game_id=$1 AND user_id=$2`;

const SET_CURRENT_PLAYER_SQL = `UPDATE game_users gu SET current=$1 WHERE game_id=$2 AND user_id=$3`;
const USER_ID_OF_NEXT_CURRENT_PLAYER_SQL = `SELECT gu.user_id FROM game_users gu WHERE game_id=$1 AND play_order=$2`;

const setAndGetNewCurrentPlayer = async (game_id) => {
  const currentPlayer = await getCurrentPlayerOfGame(game_id);

  // get the current player's play order
  const currentPlayerPlayOrder = await db.one(
    GET_CURRENT_PLAYER_PLAY_ORDER_SQL,
    [game_id, currentPlayer.user_id]
  );

  // set current player's current field to false
  await db.none(SET_CURRENT_PLAYER_SQL, [
    false,
    game_id,
    currentPlayer.user_id,
  ]);

  // get number of players in the game
  const { count: numberOfPlayersInGame } = await db.one(
    NUMBER_OF_PLAYERS_IN_GAME_SQL,
    [game_id]
  );

  // get play order of next current player
  // TODO: use a while loop to get the next non-resigned player;
  let playOrderOfNextCurrentPlayer;
  if (currentPlayerPlayOrder.play_order == numberOfPlayersInGame) {
    playOrderOfNextCurrentPlayer = 1;
  } else {
    playOrderOfNextCurrentPlayer = currentPlayerPlayOrder.play_order + 1;
  }

  // get id of this next current player
  const userIdOfNextCurrentPlayer = await db.one(
    USER_ID_OF_NEXT_CURRENT_PLAYER_SQL,
    [game_id, playOrderOfNextCurrentPlayer]
  );

  // set new current player
  await db.none(SET_CURRENT_PLAYER_SQL, [
    true,
    game_id,
    userIdOfNextCurrentPlayer.user_id,
  ]);

  return userIdOfNextCurrentPlayer;
};

const UPDATE_GAME_TILES_SQL = `UPDATE game_tiles SET user_id=$1, x=$2, y=$3 WHERE game_id=$4 AND tile_id=$5`;

const updateGameTiles = async (game_id, user_id, tile_id, x, y) => {
  await db.none(UPDATE_GAME_TILES_SQL, [user_id, x, y, game_id, tile_id]);
};

const TILE_VALUE_SQL = `SELECT point_value FROM canonical_tiles WHERE id=$1`;
const UPDATE_USER_SCORE_IN_GAME_SQL = `UPDATE game_users SET score = score + $1 WHERE game_id=$2 AND user_id=$3`;

// takes a tile and adds the point_value of the tile to the user's score
const updateUserScoreInGame = async (game_id, user_id, tile_id) => {
  // get point value of tile
  const tilePointValueResult = await db.one(TILE_VALUE_SQL, [tile_id]);
  const tilePointValue = tilePointValueResult.point_value;

  const oldScore = await getUserScoreInGame(game_id, user_id);

  // update user score based on tile value
  await db.none(UPDATE_USER_SCORE_IN_GAME_SQL, [
    tilePointValue,
    game_id,
    user_id,
  ]);
  await getUserScoreInGame(game_id, user_id);
};

const GET_USER_SCORE_IN_GAME_SQL = `SELECT user_id, score FROM game_users WHERE game_id=$1 AND user_id=$2`;

const getUserScoreInGame = async (game_id, user_id) => {
  return await db.one(GET_USER_SCORE_IN_GAME_SQL, [game_id, user_id]);
};

const GET_NUMBER_OF_TILES_IN_BAG_SQL = `SELECT COUNT(*) FROM game_tiles WHERE game_id=$1 AND user_id=-1`;

const getNumberOfTilesInBag = async (game_id) => {
  return await db.one(GET_NUMBER_OF_TILES_IN_BAG_SQL, [game_id]);
};

const GET_TILES_FROM_BAG_SQL = `SELECT tile_id FROM game_tiles WHERE game_id=$1 AND user_id=-1 ORDER BY random() LIMIT $2`;
const GIVE_TILES_FROM_BAG_TO_USER_SQL = `
  UPDATE game_tiles
  SET user_id=$1
  WHERE game_id=$2 AND tile_id = ANY ($3)
  RETURNING tile_id`;

const giveTilesFromBagToUser = async (user_id, game_id, number_of_tiles) => {
  // get number_of_tiles from bag
  const tilesFromBag = await db.any(GET_TILES_FROM_BAG_SQL, [
    game_id,
    number_of_tiles,
  ]);

  let arrayOfTilesFromBag = [];
  tilesFromBag.forEach((tileFromBag) => {
    arrayOfTilesFromBag.push(tileFromBag.tile_id);
  });

  const newTileIDsForPlayer = await db.any(GIVE_TILES_FROM_BAG_TO_USER_SQL, [
    user_id,
    game_id,
    arrayOfTilesFromBag,
  ]);

  let arrayOfTileIdsForPlayer = [];
  newTileIDsForPlayer.forEach((newTileIDForPlayer) => {
    arrayOfTileIdsForPlayer.push(newTileIDForPlayer.tile_id);
  });

  const canonicalInformationAboutTiles = await db.any(
    `SELECT id, letter FROM canonical_tiles WHERE id = ANY ($1)`,
    [arrayOfTileIdsForPlayer]
  );

  return canonicalInformationAboutTiles;
};

const CHECK_USER_HAS_TILE_SQL = `SELECT EXISTS(SELECT * FROM game_tiles WHERE user_id=$1 AND game_id=$2 AND tile_id=$3)`;

const checkUserHasTile = async (user_id, game_id, tile_id) => {
  const result = await db.one(CHECK_USER_HAS_TILE_SQL, [
    user_id,
    game_id,
    tile_id,
  ]);
  return result.exists;
};

const PLAYERS_AND_SCORES_SQL = `SELECT u.id, u.username, gu.score FROM game_users gu, users u WHERE gu.game_id=$1 AND gu.user_id=u.id`;

const playersAndScores = async (game_id) => {
  return await db.any(PLAYERS_AND_SCORES_SQL, [game_id]);
};

const PLAYER_IN_GAME_SQL = `SELECT EXISTS(SELECT * FROM game_users WHERE user_id=$1 AND game_id=$2)`;

const playerInGame = async (user_id, game_id) => {
  return await db.any(PLAYER_IN_GAME_SQL, [user_id, game_id]);
};

const USER_CAN_MAKE_TURN_SQL = `SELECT EXISTS(SELECT * FROM game_users WHERE user_id=$1 AND game_id=$2 AND current=true)`;

const userCanMakeTurn = async (userID, gameID) => {
  return await db.any(USER_CAN_MAKE_TURN_SQL, [userID, gameID]);
};

module.exports = {
  list,
  create,
  join,
  information,
  getBoard,
  games_user_is_in,
  check_user_in_game,
  getCanonicalTiles,
  insertIntoGameTiles,
  getGameTiles,
  getCurrentPlayerOfGame,
  setAndGetNewCurrentPlayer,
  updateGameTiles,
  getNumberOfTilesInBag,
  giveTilesFromBagToUser,
  checkUserHasTile,
  playersAndScores,
  playerInGame,
  userCanMakeTurn,
  updateUserScoreInGame,
  getUserScoreInGame,
};
