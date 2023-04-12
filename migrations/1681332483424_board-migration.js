/* eslint-disable camelcase */

/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("board", {
    x: {
      type: "integer",
    },
    y: {
      type: "integer",
    },
    letter_multiplier: {
      type: "integer",
      default: 1,
    },
    word_multiplier: {
      type: "integer",
      default: 1,
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("board");
};
