const express = require("express");
const router = express.Router();
const db = require("../../db/connection.js");

router.get("/", (request, response) => {
  db.any(`SELECT * FROM canonical_tiles`)
    .then((results) => response.json(results))
    .catch((error) => {
      console.log(error);
      response.json({ error });
    });
});

module.exports = router;
