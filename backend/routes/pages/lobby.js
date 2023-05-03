const express = require("express");
const Games = require("../../db/games");
const Chat = require("../../db/chat");

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: user_id } = request.session.user;

  try {
    const availableGames = await Games.list(user_id);
    const chat = await Chat.getMessages(0);
    response.render("lobby", {
      title: "Lobby",
      games: availableGames,
      messages: chat,
      ...request.session.user,
    });
  } catch (error) {
    console.log({ error });
    response.render("lobby", {
      title: "Lobby",
      games: [],
      messages: [],
      ...request.session.user,
    });
  }
});

module.exports = router;
