const express = require("express");
const router = express.Router();

router.get("/", (request, response) => {
  response.render("home", {
    title: "Term Project (Home)",
  });
});

module.exports = router;
