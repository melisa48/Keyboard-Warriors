const express = require("express");
const Games = require("../../db/games");

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: user_id } = request.session.user;

  try {
    const availableGames = await Games.list(user_id);
    response.render("lobby", {
      title: "Lobby",
      games: availableGames,
      ...request.session.user,
    });
  } catch (error) {
    console.log({ error });
    response.render("lobby", {
      title: "Lobby",
      games: [],
      ...request.session.user,
    });
  }
});

module.exports = router;
