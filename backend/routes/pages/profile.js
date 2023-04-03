const express = require("express");
const router = express.Router();

router.get("/", (request, response) => {
  response.render("profile", {
    title: "Term Project (Profile)",
  });
});

module.exports = router;
