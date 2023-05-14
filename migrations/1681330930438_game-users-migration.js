/* eslint-disable camelcase */

/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("game_users", {
    game_id: {
      type: "integer",
      references: "games(id)",
    },
    user_id: {
      type: "integer",
      references: "users(id)",
    },
    score: {
      type: "integer",
      default: 0,
    },
    current: {
      type: "boolean",
    },
    play_order: {
      type: "integer",
    },
    resigned: {
      type: "boolean",
      default: false,
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("game_users");
};
