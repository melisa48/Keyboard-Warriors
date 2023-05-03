const db = require("./connection");

const create = (message, sender_id, game_id) =>
  db.one(
    "INSERT INTO chat (sender_id, message,game_id) VALUES ($1, $2, $3) RETURNING created_at",
    [sender_id, message, game_id]
  );

const GET_MESSAGES_SQL = `SELECT users.username, chat.message, chat.created_at FROM chat JOIN users ON chat.sender_id= users.id WHERE game_id = $1`;
const getMessages = async (game_id) => {
  return db.any(GET_MESSAGES_SQL, game_id);
};

module.exports = {
  create,
  getMessages,
};
