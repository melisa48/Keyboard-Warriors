const db = require("./connection");

const GAME_INFORMATION_SQL = `SELECT * FROM games WHERE id=$1`;

const SET_GAME_ENDED_SQL = `UPDATE games SET game_ended=true WHERE id=$1`;

const CREATE_GAME_SQL =
  "INSERT INTO games (title, player_count) VALUES ($1, $2) RETURNING id, created_at";

const GAMES_LIST_SQL = `
SELECT g.id, g.title, g.created_at FROM games g WHERE g.id NOT IN
  (SELECT gu.game_id FROM game_users gu WHERE gu.user_id = $1) AND
(SELECT COUNT(*) FROM game_users WHERE game_users.game_id=g.id) < g.player_count AND
g.started_at IS NULL`;

const GAMES_USER_IS_IN_SQL = `SELECT gu.game_id, g.title FROM game_users gu, games g
  WHERE gu.game_id = g.id AND gu.user_id=$1`;

const SET_STARTED_AT_TIME_SQL = `UPDATE games SET started_at=$1 WHERE id=$2`;

const CHECK_GAME_STARTED_SQL = `SELECT * FROM games WHERE id=$1 AND started_at IS NOT NULL`;

const SET_FIRST_WORD_PLACED_TO_TRUE_SQL = `UPDATE games SET first_word_placed=true WHERE id=$1`;

const FIRST_WORD_PLACED_IN_GAME_SQL = `SELECT EXISTS(SELECT * FROM games WHERE id=$1 AND first_word_placed=true)`;

const SET_GAME_PASS_COUNT_SQL = `UPDATE games SET pass_count=$1 WHERE id=$2`;

const gameInformation = async (game_id) => {
  return await db.one(GAME_INFORMATION_SQL, [game_id]);
};

const setGameEnded = async (game_id) => {
  await db.none(SET_GAME_ENDED_SQL, [game_id]);
};

const create = async (game_title, number_of_players) => {
  const { id: game_id } = await db.one(CREATE_GAME_SQL, [
    game_title,
    number_of_players,
  ]);

  return { game_id };
};

const list = async (user_id) => db.any(GAMES_LIST_SQL, [user_id]);

const gamesUserIsIn = async (user_id) => {
  return db.any(GAMES_USER_IS_IN_SQL, [user_id]);
};

const setStartedAtTime = async (game_id) => {
  const now = new Date();
  await db.none(SET_STARTED_AT_TIME_SQL, [now, game_id]);
};

const checkGameStarted = async (game_id) => {
  const result = await db.oneOrNone(CHECK_GAME_STARTED_SQL, [game_id]);

  return result != undefined;
};

const setFirstWordPlacedToTrue = async (gameID) => {
  await db.none(SET_FIRST_WORD_PLACED_TO_TRUE_SQL, [gameID]);
};

const firstWordPlacedInGame = async (gameID) => {
  const result = await db.one(FIRST_WORD_PLACED_IN_GAME_SQL, [gameID]);
  return result.exists;
};

const setGamePassCount = async (count, gameID) => {
  await db.none(SET_GAME_PASS_COUNT_SQL, [count, gameID]);
};

module.exports = {
  gameInformation,
  setGameEnded,
  list,
  create,
  gamesUserIsIn,
  firstWordPlacedInGame,
  setFirstWordPlacedToTrue,
  setStartedAtTime,
  checkGameStarted,
  setGamePassCount,
};
