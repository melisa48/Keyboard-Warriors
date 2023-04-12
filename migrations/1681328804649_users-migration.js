/* eslint-disable camelcase */

/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    full_name: {
      type: "varchar(255)",
    },
    username: {
      type: "varchar(255)",
      unique: true,
    },
    email: {
      type: "varchar(255)",
      unique: true,
    },
    password: {
      type: "varchar(255)",
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("users");
};
