const db = require("./connection");

const create = (message, sender_id) =>
  db.one(
    "INSERT INTO chat (sender_id, message) VALUES ($1, $2) RETURNING created_at",
    [sender_id, message]
  );

module.exports = {
  create,
};
