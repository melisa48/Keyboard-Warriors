require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const pgSession = require("connect-pg-simple")(session);
const session = require("express-session");

const createError = require("http-errors");
const {gameRoutes,homeRoutes,lobbyRoutes,
      profileRoutes,authenticationRoutes,chatRoutes} = require("./routes/index");
const canonicalTilesRoute = require("./routes/testing/canonical_tiles");
const boardRoute = require("./routes/testing/board");

const db = require("./db/connection");
const requireAuthentication = require("./middleware/require-authentication");
const initSockets = require("./sockets/initialize");

const app = express();

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "development") {
  const liveReload = require("livereload");
  const connectLiveReload = require("connect-livereload");

  const liveReloadServer = liveReload.createServer();
  liveReloadServer.watch(path.join(__dirname, "static"));
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLiveReload());
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "static")));
app.use(cookieParser());

const sessionMiddleware = session({
  store: new pgSession({ pgPromise: db }),
  secret: process.env.SECRET,
  resave: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  saveUninitialized: false,
});

app.use(sessionMiddleware);
const server = initSockets(app, sessionMiddleware);

app.use("/", homeRoutes);
app.use("/games", requireAuthentication, gameRoutes);
app.use("/lobby", requireAuthentication, lobbyRoutes);
app.use("/profile", requireAuthentication, profileRoutes);
app.use("/authentication", authenticationRoutes);
app.use("/chat", chatRoutes);
app.use("/canonical-tiles", canonicalTilesRoute);
app.use("/board", boardRoute);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((request, response, next) => {
  next(createError(404));
});
