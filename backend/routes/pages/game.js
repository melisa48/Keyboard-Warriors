const express = require("express");
const router = express.Router();

router.get("/:id", (request, response) => {
  const id = request.params.id;

  response.render("game", {
    title: "Term Project (Game)",
    gameID: id,
    ...request.session.user,
  });
});

module.exports = router;
