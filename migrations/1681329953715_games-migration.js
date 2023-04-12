/* eslint-disable camelcase */

/*
id int PK
  player_count int
  title varchar(255)
  created_at timestamp
  started_at timestamp
  pass_count int
*/

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
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
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
