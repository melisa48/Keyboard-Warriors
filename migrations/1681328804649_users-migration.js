/* eslint-disable camelcase */

/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    full_name: {
      type: "varchar(70)",
      notNull: true,
    },
    username: {
      type: "varchar(50)",
      unique: true,
      notNull: true,
    },
    email: {
      type: "varchar(255)",
      unique: true,
      notNull: true,
    },
    password: {
      type: "char(60)",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable("users");
};
