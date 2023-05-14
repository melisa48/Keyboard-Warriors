const db = require("./connection");

const GET_CANONICAL_TILES_SQL = `SELECT * FROM canonical_tiles;`;

const GET_TILE_POINT_VALUE_SQL = `SELECT point_value FROM canonical_tiles WHERE id=$1`;

const CANONICAL_INFORMATION_ABOUT_TILES = `SELECT id, letter FROM canonical_tiles WHERE id = ANY ($1)`;

const getCanonicalTiles = async () => {
  return db.any(GET_CANONICAL_TILES_SQL);
};

const getTilePointValue = async (tile_id) => {
  return (await db.one(GET_TILE_POINT_VALUE_SQL, [tile_id])).point_value;
};

const canonicalInformationAboutTiles = async (arrayOfTileIdsForPlayer) => {
  return await db.any(CANONICAL_INFORMATION_ABOUT_TILES, [
    arrayOfTileIdsForPlayer,
  ]);
};

module.exports = {
  getCanonicalTiles,
  getTilePointValue,
  canonicalInformationAboutTiles,
};
