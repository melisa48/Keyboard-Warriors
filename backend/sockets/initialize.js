const http = require("http");
const { Server } = require("socket.io");

const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (socket) => {
    console.log("Connection");
    socket.join(socket.handshake.query.roomName);
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
