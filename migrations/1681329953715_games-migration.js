/* eslint-disable camelcase */

/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("games", {
    id: "id",
    player_count: {
      type: "integer",
    },
    title: {
      type: "varchar(255)",
    },
    pass_count: {
      type: "integer",
      default: 0,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    first_word_placed: {
      type: "boolean",
      default: false,
    },
    started_at: {
      type: "timestamp",
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("games");
};
