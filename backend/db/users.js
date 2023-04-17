const db = require("./connection");

const create = (full_name, username, email, password) =>
  db.one(
    "INSERT INTO users (full_name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
    [full_name, username, email, password]
  );

module.exports = {
  create,
};
