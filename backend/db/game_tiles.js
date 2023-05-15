const db = require("./connection");

const INSERT_INTO_GAME_TILES = `INSERT INTO game_tiles (game_id, user_id, tile_id, x, y) VALUES ($1, $2, $3, $4, $5)`;

const GET_GAME_TILES_OF_GAME_SQL = `SELECT * FROM game_tiles gt, canonical_tiles ct WHERE gt.game_id=$1 AND gt.tile_id = ct.id`;

const UPDATE_GAME_TILES_SQL = `UPDATE game_tiles SET user_id=$1, x=$2, y=$3 WHERE game_id=$4 AND tile_id=$5`;

const GET_NUMBER_OF_TILES_IN_BAG_SQL = `SELECT COUNT(*) FROM game_tiles WHERE game_id=$1 AND user_id=-1`;

const GET_TILES_FROM_BAG_SQL = `SELECT tile_id FROM game_tiles WHERE game_id=$1 AND user_id=-1 ORDER BY random() LIMIT $2`;

const GIVE_TILES_FROM_BAG_TO_USER_SQL = `
  UPDATE game_tiles
  SET user_id=$1
  WHERE game_id=$2 AND tile_id = ANY ($3)
  RETURNING tile_id`;

const GIVE_TILES_FROM_USER_TO_BAG_SQL = `
  UPDATE game_tiles
  SET user_id=-1, x=-1, y=-1
  WHERE game_id=$1 AND user_id=$2`;

const CHECK_USER_HAS_TILE_SQL = `SELECT EXISTS(SELECT * FROM game_tiles WHERE user_id=$1 AND game_id=$2 AND tile_id=$3)`;

const CHECK_IF_TILE_ON_BOARD_ALREADY_SQL = `SELECT EXISTS(SELECT * FROM game_tiles WHERE game_id=$1 AND user_id=0 AND x=$2 AND y=$3)`;

const GET_TILE_ON_GAME_BOARD_SQL = `
SELECT gt.tile_id, ct.letter
FROM game_tiles gt, canonical_tiles ct
WHERE gt.x=$1 AND gt.y=$2 AND gt.user_id=0 AND gt.game_id=$3 AND gt.tile_id=ct.id`;

const insertIntoGameTiles = async (game_id, user_id, tile_id, x, y) => {
  await db.none(INSERT_INTO_GAME_TILES, [game_id, user_id, tile_id, x, y]);
};

const getGameTilesOfGame = async (game_id) => {
  return await db.any(GET_GAME_TILES_OF_GAME_SQL, game_id);
};

const updateGameTiles = async (game_id, user_id, tile_id, x, y) => {
  await db.none(UPDATE_GAME_TILES_SQL, [user_id, x, y, game_id, tile_id]);
};

const getNumberOfTilesInBag = async (game_id) => {
  return await db.one(GET_NUMBER_OF_TILES_IN_BAG_SQL, [game_id]);
};

const getTilesFromBag = async (game_id, number_of_tiles) => {
  return await db.any(GET_TILES_FROM_BAG_SQL, [game_id, number_of_tiles]);
};

const giveTilesFromBagToUser = async (
  user_id,
  game_id,
  array_of_tiles_from_bag
) => {
  return await db.any(GIVE_TILES_FROM_BAG_TO_USER_SQL, [
    user_id,
    game_id,
    array_of_tiles_from_bag,
  ]);
};

const giveTilesFromUserToBag = async (game_id, user_id) => {
  await db.none(GIVE_TILES_FROM_USER_TO_BAG_SQL, [game_id, user_id]);
};

const checkUserHasTile = async (user_id, game_id, tile_id) => {
  const result = await db.one(CHECK_USER_HAS_TILE_SQL, [
    user_id,
    game_id,
    tile_id,
  ]);
  return result.exists;
};

const tileOnBoardAlready = async (gameID, x, y) => {
  // tile is taken if the user_id = 0 (tile is already on the board)
  return (await db.one(CHECK_IF_TILE_ON_BOARD_ALREADY_SQL, [gameID, x, y]))
    .exists;
};

const getTileOnGameBoard = async (gameID, x, y) => {
  const tile = await db.any(GET_TILE_ON_GAME_BOARD_SQL, [x, y, gameID]);

  return tile[0];
};

module.exports = {
  insertIntoGameTiles,
  getGameTilesOfGame,
  updateGameTiles,
  getNumberOfTilesInBag,
  getTilesFromBag,
  giveTilesFromBagToUser,
  giveTilesFromUserToBag,
  checkUserHasTile,
  tileOnBoardAlready,
  getTileOnGameBoard,
};
