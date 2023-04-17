const express = require("express");
const bcrypt = require("bcrypt");
const Users = require("../../db/users");

const router = express.Router();

router.get("/", (request, response) => {
  response.render("log-in", {
    title: "Term Project (Log-In)",
  });
});

router.post("/", async (request, response) => {
  const { email, password } = request.body;

  try {
    // get user from database
    const user = await Users.findByEmail(email);

    // compare plaintext password to hash stored in database
    const isValidUser = await bcrypt.compare(password, user.password);

    if (isValidUser) {
      response.redirect("/lobby");
    } else {
      throw "User didn't provide valid credentials.";
    }
  } catch (error) {
    response.render("log-in", {
      title: "Term Project (Log-In)",
      email,
      password,
      message: "Error!",
    });
  }
});

module.exports = router;
