const express = require("express");
const bcrypt = require("bcrypt");
const Users = require("../../db/users");

const router = express.Router();

const SALT_ROUNDS = 10;

router.get("/", (request, response) => {
  response.render("sign-up", {
    title: "Term Project (Sign-Up)",
  });
});

router.post("/", async (request, response) => {
  const { full_name, username, email, password } = request.body;

  // encrypt the plaintext password
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    // add record to database
    const id = await Users.create(full_name, username, email, hash);

    // redirect the user to the lobby as they are now authenticated
    response.redirect("/lobby");
  } catch (error) {
    response.render("sign-up", {
      title: "Term Project (Sign-Up)",
      full_name,
      username,
      email,
      password,
      message: "Error!",
    });
  }
});

module.exports = router;
