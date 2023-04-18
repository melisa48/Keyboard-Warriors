require("dotenv").config();
const express = require("express");
const createError = require("http-errors");
const {
  gameRoutes,
  homeRoutes,
  lobbyRoutes,
  profileRoutes,
  authenticationRoutes,
} = require("./routes/index");
const canonicalTilesRoute = require("./routes/testing/canonical_tiles");
const boardRoute = require("./routes/testing/board");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const db = require("./db/connection");

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
app.use(
  session({
    store: new pgSession({ pgPromise: db }),
    secret: process.env.SECRET,
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    saveUninitialized: false,
  })
);

app.use("/", homeRoutes);
app.use("/games", gameRoutes);
app.use("/lobby", lobbyRoutes);
app.use("/profile", profileRoutes);
app.use("/authentication", authenticationRoutes);
app.use("/canonical-tiles", canonicalTilesRoute);
app.use("/board", boardRoute);

app.use((request, response, next) => {
  next(createError(404));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
