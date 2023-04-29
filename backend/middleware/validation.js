const Users = require("../db/users");

const registerValidator = async function (request, response, next) {
  const { username, email } = request.body;
  const userExists = await Users.usernameDoesExist(username); //checks db for pre-existing username
  const emailExists = await Users.emailDoesExist(email); //checks db for pre-existing email

  if (userExists) {
    response.render("sign-up", {
      title: "Term Project (Sign-Up)",
      message: "Username already exists",
    });
  } else if (emailExists) {
    response.render("sign-up", {
      title: "Term Project (Sign-Up)",
      message: "Email already exists",
    });
  } else {
    next();
  }
};

module.exports = registerValidator;
