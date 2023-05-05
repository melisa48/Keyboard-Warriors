const express = require("express");
const Games = require("../../db/games");
const Chat = require("../../db/chat");

const requireToBeInGame = require("../../middleware/require-to-be-in-game");

const router = express.Router();

router.get("/create-game", (request, response) => {
  response.render("create-game", {
    title: "Create Game",
    ...request.session.user,
  });
});

router.get("/:id/start-game", requireToBeInGame, (request, response) => {
  const { id: game_id } = request.params;

  // TODO: update started_at field in games table

  response.redirect(`/games/${game_id}`);
});

router.get(
  "/:id/waiting-room",
  requireToBeInGame,
  async (request, response) => {
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
  }
);

router.get("/:id", requireToBeInGame, async (request, response) => {
  const id = request.params.id;

  const b_layout = await Games.board();
  let board_obj = b_layout.board_layout;

  const chat = await Chat.getMessages(id);

  response.render("game", {
    title: "Term Project (Game)",
    gameID: id,
    board_obj,
    messages: chat,
    ...request.session.user,
  });
});

module.exports = router;
