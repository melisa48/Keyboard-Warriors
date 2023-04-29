const express = require("express");
const Games = require("../../db/games");

const router = express.Router();

router.get("/create-game", (request, response) => {
  response.render("create-game", {
    title: "Create Game",
  });
});

router.get("/:id/start-game", (request, response) => {
  const { id: game_id } = request.params;

  // TODO: update started_at field in games table

  response.redirect(`/games/${game_id}`);
});

router.get("/:id/waiting-room", async (request, response) => {
  const { id: game_id } = request.params;

  const { game_title, players: playersInGame } = await Games.information(
    game_id
  );

  response.render("waiting-room", {
    title: "Waiting Room",
    gameTitle: game_title,
    gameID: game_id,
    players: playersInGame,
    ...request.session.user,
  });
});

router.get("/:id", (request, response) => {
  const id = request.params.id;

  response.render("game", {
    title: "Term Project (Game)",
    gameID: id,
    ...request.session.user,
  });
});

module.exports = router;
