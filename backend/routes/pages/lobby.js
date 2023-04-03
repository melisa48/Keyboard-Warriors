const express = require("express");
const router = express.Router();

router.get("/", (request, response) => {
  response.render("lobby", {
    title: "Term Project (Lobby)",
  });
});

module.exports = router;
