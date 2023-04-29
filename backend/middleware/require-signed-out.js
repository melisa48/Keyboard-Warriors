// used for pages that require the user to not be logged in
const requireSignedOut = (request, response, next) => {
  // a user will have information in request.session.user if they are logged in
  const { user } = request.session;

  if (user == undefined || user == null) {
    next();
  } else {
    response.redirect("/lobby");
  }
};

module.exports = requireSignedOut;
