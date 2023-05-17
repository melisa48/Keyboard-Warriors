const express = require("express");
const bcrypt = require("bcrypt");
const Users = require("../../db/users");
const registerValidator = require("../../middleware/validation.js");

const router = express.Router();

const SALT_ROUNDS = 10;

router.get("/sign-up", (request, response) => {
  response.render("sign-up", {
    title: "Term Project (Sign-Up)",
  });
});

router.post("/sign-up", registerValidator, async (request, response) => {
  const { full_name, username, email, password } = request.body;
  // encrypt the plaintext password
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    // add record to database
    const { id } = await Users.create(full_name, username, email, hash);

    // create a user object within the session
    request.session.user = {
      id,
      username,
      email,
    };

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

router.get("/log-in", (request, response) => {
  response.render("log-in", {
    title: "Term Project (Log-In)",
  });
});

router.post("/log-in", async (request, response) => {
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
      message: "Invalid login credentials.",
    });
  }
});

module.exports = router;
