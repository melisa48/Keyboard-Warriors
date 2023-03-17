const express = require("express");
const createError = require("http-errors");
const rootRoutes = require("./routes/root");
const path = require("path");

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

app.use(express.static(path.join(__dirname, "static")));
app.use("/", rootRoutes);
app.use((request, response, next) => {
  next(createError(404));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});