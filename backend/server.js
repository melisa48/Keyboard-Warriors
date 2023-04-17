require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const {
  gameRoutes,
  homeRoutes,
  lobbyRoutes,
  logInRoutes,
  profileRoutes,
  signUpRoutes,
} = require("./routes/index");
const canonicalTilesRoute = require("./routes/testing/canonical_tiles");
const boardRoute = require("./routes/testing/board");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "static")));

app.use("/", homeRoutes);
app.use("/games", gameRoutes);
app.use("/lobby", lobbyRoutes);
app.use("/log-in", logInRoutes);
app.use("/profile", profileRoutes);
app.use("/sign-up", signUpRoutes);
app.use("/canonical-tiles", canonicalTilesRoute);
app.use("/board", boardRoute);

app.use((request, response, next) => {
  next(createError(404));
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
