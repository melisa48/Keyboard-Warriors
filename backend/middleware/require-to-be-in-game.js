const Games = require("../db/games");
const getGameId = require("../../shared/get-game-id");

// used for game pages, that require the player to be in the game to see the page
const requireToBeInGame = async (request, response, next) => {
  const { user } = request.session;

  const gameID = getGameId(request.originalUrl);

  // check if user in game
  const userInGame = await Games.check_user_in_game(user.id, gameID);

  if (userInGame) {
    next();
  } else {
    response.redirect("/lobby");
  }
};

module.exports = requireToBeInGame;
