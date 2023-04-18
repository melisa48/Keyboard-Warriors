const requireAuthentication = (request, response, next) => {
  // a user will have information in request.session.user if they are logged in
  const { user } = request.session;

  if (user == undefined || user == null) {
    response.redirect("/authentication/log-in");
  } else {
    next();
  }
};

module.exports = requireAuthentication;
