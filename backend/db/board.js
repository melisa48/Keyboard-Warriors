const db = require("./connection");

const GET_BOARD_SQL = `SELECT * FROM board;`;

const GET_LETTER_AND_WORD_MULTIPLIER_OF_POSITION_SQL = `
SELECT letter_multiplier, word_multiplier
FROM board WHERE x=$1 AND y=$2`;

const getBoard = async () => {
  return db.any(GET_BOARD_SQL);
};

const getLetterAndWordMultiplierOfPosition = async (x, y) => {
  return await db.one(GET_LETTER_AND_WORD_MULTIPLIER_OF_POSITION_SQL, [x, y]);
};

module.exports = {
  getBoard,
  getLetterAndWordMultiplierOfPosition,
};
