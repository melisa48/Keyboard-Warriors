const express = require("express");
const router = express.Router();
const events = require("../../sockets/constants");
const Chat = require("../../db/chat");

router.post("/:id", async (request, response) => {
  const io = request.app.get("io");
  const { message } = request.body;
  const { username, id } = request.session.user;
  const roomId = request.params.id;

  const { created_at: timestamp } = await Chat.create(message, id, roomId);
  io.to(roomId).emit(events.CHAT_MESSAGE_RECEIVED, {
    message,
    username,
    timestamp,
  });

  response.status(200);
});

module.exports = router;
