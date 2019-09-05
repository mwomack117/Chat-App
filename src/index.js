const path = require("path");
const Filter = require("bad-words");
const express = require("express");
const { generateMessage } = require("./utils/messages");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", socket => {
  console.log("New Websocket connection");
  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit("message", generateMessage("A new user has joined"));

  socket.on("sendMessage", (message, cb) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return cb("Profanity is not allowed");
    }

    io.emit("message", generateMessage(message));
    cb();
  });

  socket.on("sendLocation", (location, cb) => {
    io.emit(
      "locationMessage",
      `https://google.com/maps?q=${location.lat},${location.long}`
    );
    cb();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left"));
  });
});

server.listen(port, () => console.log(`Chat App listening on port ${port}!`));
