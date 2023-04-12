/* eslint-disable camelcase */

/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("game_tiles", {
    game_id: {
      type: "integer",
      references: "games(id)",
    },
    user_id: {
      type: "integer",
      references: "users(id)",
    },
    tile_id: {
      type: "integer",
      references: "canonical_tiles(id)",
    },
    x: {
      type: "integer",
    },
    y: {
      type: "integer",
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("game_tiles");
};
