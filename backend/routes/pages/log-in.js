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
  const { email: requestEmail, password: requestPassword } = request.body;

  try {
    // get user from database
    const {
      id,
      username,
      email,
      password: hashedPassword,
    } = await Users.findByEmail(requestEmail);

    // compare plaintext password to hash stored in database
    const isValidUser = await bcrypt.compare(requestPassword, hashedPassword);

    if (isValidUser) {
      // create a user object within the session
      request.session.user = {
        id,
        username,
        email,
      };

      response.redirect("/lobby");
    } else {
      throw "User didn't provide valid credentials.";
    }
  } catch (error) {
    response.render("log-in", {
      title: "Term Project (Log-In)",
      requestEmail,
      requestPassword,
      message: "Error!",
    });
  }
});

module.exports = router;
