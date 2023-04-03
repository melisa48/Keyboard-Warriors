const express = require("express");
const router = express.Router();

router.get("/", (request, response) => {
  response.render("log-in", {
    title: "Term Project (Log-In)",
  });
});

module.exports = router;
