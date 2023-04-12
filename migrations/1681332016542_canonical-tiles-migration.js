/* eslint-disable camelcase */

/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("canonical_tiles", {
    id: "id",
    point_value: {
      type: "integer",
      notNull: true,
    },
    letter: {
      type: "varchar(1)",
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("canonical_tiles");
};
