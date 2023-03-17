const express = require("express");
const router = express.Router();

router.get("/", (request, response) => {
  const title = "A Great Title";
  const name = "My Name";

  response.render("home", {
    title: title,
    name: name
  })
});

module.exports = router;