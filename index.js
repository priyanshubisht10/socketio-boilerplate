const express = require("express");
const http = require("http");
const path = require("path");

const app = express();

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const { v4: uuidV4 } = require("uuid");

// app.use(express.static("/public"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.route("/").get((res) => {
  res.sendFile("./public/index.html");
});

app.route("/video-chat").get((req, res) => {
  res.redirect(`./${uuidV4()}`);
});

app.route("/video-chat/:room").get((req, res) => {
  res.render("./room.ejs", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  console.log("New user connected", socket.id);
  socket.on("message", (msg) => {
    // console.log("Recieved new message from client. Message:", msg);
    io.emit("msg-from-server", socket.id + ": " + msg); //emitting the msg from the server with the id msg-from-server
  });

  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);

    socket.to(roomId).emit("user-connected", userId);

    // socket.on("disconnect", () => {
    //   socket.to(roomId).emit("user-disconnected", userId);
    // });
  });
});

server.listen(9000, () => {
  console.log("Server initialized at port: 9000");
});
