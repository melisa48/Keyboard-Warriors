/* eslint-disable camelcase */
/**
 *
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("session", {
    sid: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    sess: {
      type: "string",
    },
    expire: {
      type: "TIMESTAMP",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.addConstraint("session", "session_pkey", {
    primaryKey: "sid",
    deferrable: false,
  });

  pgm.createIndex("session", "expire", { name: "IDX_session_expire" });
};

exports.down = (pgm) => {
  pgm.dropTable("session");
};
