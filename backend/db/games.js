const db = require("./connection");

const CREATE_GAME_SQL =
  "INSERT INTO games (title, player_count) VALUES ($1, $2) RETURNING id, created_at";

const INSERT_USER_IN_GAME_SQL =
  "INSERT INTO game_users (game_id, user_id, current, play_order) VALUES ($1, $2, $3, $4)";

const GAMES_LIST_SQL = `
  SELECT g.id, g.title, g.created_at FROM games g WHERE g.id NOT IN
    (SELECT gu.game_id FROM game_users gu WHERE gu.user_id = $1) AND
  (SELECT COUNT(*) FROM game_users WHERE game_users.game_id=g.id) < g.player_count`;

const NUMBER_OF_PLAYERS_IN_GAME_SQL =
  "SELECT COUNT(*) FROM game_users WHERE game_id = $1";

const GAME_TITLE_SQL = `SELECT title FROM games WHERE id=$1`;

const PLAYERS_IN_GAME_SQL = `SELECT u.username FROM users u WHERE u.id IN 
  (SELECT gu.user_id FROM game_users gu WHERE gu.game_id = $1)`;

const list = async (user_id) => db.any(GAMES_LIST_SQL, [user_id]);

const create = async (user_id, game_title, number_of_players) => {
  const { id: game_id } = await db.one(CREATE_GAME_SQL, [
    game_title,
    number_of_players,
  ]);

  await db.none(INSERT_USER_IN_GAME_SQL, [game_id, user_id, true, 1]);

  return { game_id };
};

const join = async (user_id, game_id) => {
  const { count: numberOfPlayers } = await db.one(
    NUMBER_OF_PLAYERS_IN_GAME_SQL,
    [game_id]
  );

  db.none(INSERT_USER_IN_GAME_SQL, [
    game_id,
    user_id,
    false,
    parseInt(numberOfPlayers) + 1,
  ]);
};

const information = async (game_id) => {
  const { title: game_title } = await db.one(GAME_TITLE_SQL, [game_id]);
  const players = await db.any(PLAYERS_IN_GAME_SQL, [game_id]);

  return { game_title, players };
};

module.exports = { list, create, join, information };
