const db = require("./connection");

const SET_USER_SCORE_SQL = `UPDATE game_users
SET score=$1
WHERE game_id=$2 AND user_id=$3`;

const SET_RESIGNED_SQL = `UPDATE game_users
SET resigned=$1
WHERE game_id=$2 AND user_id=$3`;

const GET_RESIGNED_PLAYERS = `SELECT *
FROM game_users
WHERE game_id=$1 AND resigned=true`;

const GET_NON_RESIGNED_PLAYERS = `SELECT *
FROM game_users
WHERE game_id=$1 AND resigned=false`;

const PLAYERS_AND_SCORES_SQL = `SELECT u.id, u.username, gu.score
FROM game_users gu, users u
WHERE gu.game_id=$1 AND gu.user_id=u.id`;

const GET_CURRENT_PLAYER_OF_GAME_SQL = `SELECT *
FROM game_users
WHERE game_id=$1 AND current=true`;

const SET_CURRENT_PLAYER_SQL = `UPDATE game_users
SET current=$1
WHERE game_id=$2 AND user_id=$3`;

const GET_INFORMATION_GIVEN_PLAY_ORDER_SQL = `SELECT *
FROM game_users
WHERE game_id=$1 AND play_order=$2`;

const GET_NUMBER_OF_PLAYERS_SQL =
  "SELECT COUNT(*) FROM game_users WHERE game_id = $1";

const INSERT_USER_IN_GAME_SQL =
  "INSERT INTO game_users (game_id, user_id, current, play_order) VALUES ($1, $2, $3, $4)";

const PLAYERS_IN_GAME_SQL = `SELECT u.id, u.username FROM users u WHERE u.id IN 
  (SELECT gu.user_id FROM game_users gu WHERE gu.game_id = $1)`;

const CHECK_USER_IN_GAME_SQL = `SELECT EXISTS(SELECT 1 FROM game_users gu WHERE user_id=$1 AND game_id=$2)`;

const UPDATE_USER_SCORE_IN_GAME_SQL = `UPDATE game_users SET score = score + $3 WHERE game_id=$1 AND user_id=$2`;

const GET_USER_SCORE_IN_GAME_SQL = `SELECT user_id, score FROM game_users WHERE game_id=$1 AND user_id=$2`;

const PLAYER_IN_GAME_SQL = `SELECT EXISTS(SELECT * FROM game_users WHERE user_id=$1 AND game_id=$2)`;

const USER_CAN_MAKE_TURN_SQL = `SELECT EXISTS(SELECT * FROM game_users WHERE user_id=$1 AND game_id=$2 AND current=true)`;

const setUserScore = async (score, game_id, user_id) => {
  await db.none(SET_USER_SCORE_SQL, [score, game_id, user_id]);
};

const setResigned = async (resigned, game_id, user_id) => {
  await db.none(SET_RESIGNED_SQL, [resigned, game_id, user_id]);
};

const getResignedPlayers = async (game_id) => {
  return await db.any(GET_RESIGNED_PLAYERS, [game_id]);
};

const getNonResignedPlayers = async (game_id) => {
  return await db.any(GET_NON_RESIGNED_PLAYERS, [game_id]);
};

const playersAndScores = async (game_id) => {
  return await db.any(PLAYERS_AND_SCORES_SQL, [game_id]);
};

const getCurrentPlayerOfGame = async (game_id) => {
  return await db.one(GET_CURRENT_PLAYER_OF_GAME_SQL, [game_id]);
};

const setCurrentPlayerOfGame = async (current, game_id, user_id) => {
  await db.none(SET_CURRENT_PLAYER_SQL, [current, game_id, user_id]);
};

const getInformationGivenPlayOrder = async (game_id, play_order) => {
  return await db.one(GET_INFORMATION_GIVEN_PLAY_ORDER_SQL, [
    game_id,
    play_order,
  ]);
};

const getNumberOfPlayers = async (game_id) => {
  return (await db.one(GET_NUMBER_OF_PLAYERS_SQL, [game_id])).count;
};

const insertUserInGame = async (game_id, user_id, current, play_order) => {
  await db.none(INSERT_USER_IN_GAME_SQL, [
    game_id,
    user_id,
    current,
    play_order,
  ]);
};

const playersInGame = async (game_id) => {
  return await db.any(PLAYERS_IN_GAME_SQL, [game_id]);
};

const checkUserInGame = async (user_id, game_id) => {
  return (await db.one(CHECK_USER_IN_GAME_SQL, [user_id, game_id])).exists;
};

const updateUserScoreInGame = async (game_id, user_id, points_to_add) => {
  await db.none(UPDATE_USER_SCORE_IN_GAME_SQL, [
    game_id,
    user_id,
    points_to_add,
  ]);
};

const getUserScoreInGame = async (game_id, user_id) => {
  return await db.one(GET_USER_SCORE_IN_GAME_SQL, [game_id, user_id]);
};

const playerInGame = async (user_id, game_id) => {
  return await db.any(PLAYER_IN_GAME_SQL, [user_id, game_id]);
};

const userCanMakeTurn = async (userID, gameID) => {
  return await db.any(USER_CAN_MAKE_TURN_SQL, [userID, gameID]);
};

module.exports = {
  setUserScore,
  setResigned,
  getResignedPlayers,
  getNonResignedPlayers,
  playersAndScores,
  getCurrentPlayerOfGame,
  setCurrentPlayerOfGame,
  getInformationGivenPlayOrder,
  getNumberOfPlayers,
  insertUserInGame,
  playersInGame,
  checkUserInGame,
  updateUserScoreInGame,
  getUserScoreInGame,
  playerInGame,
  userCanMakeTurn,
};
