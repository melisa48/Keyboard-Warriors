const GameUsers = require("../db/game_users");
const getGameId = require("../../shared/get-game-id");

// used for game pages, that require the player to be in the game to see the page
const requireToBeInGame = async (request, response, next) => {
  const { user } = request.session;

  const gameID = getGameId(request.originalUrl);

  // check if user in game
  const userInGame = await GameUsers.checkUserInGame(user.id, gameID);

  if (userInGame) {
    next();
  } else {
    response.redirect("/lobby");
  }
};

module.exports = requireToBeInGame;
