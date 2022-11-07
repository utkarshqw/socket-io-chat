const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const chats = require("./data/data.js");
const dotenv = require("dotenv");
const connectdb = require("./config/db");
const chatRoutes = require("./routes/chat.router");
const userRoutes = require("./routes/user.router");
const messageRoutes =  require("./routes/message.router")
const { notFound, errorHandler } = require("./middlewares/error.Middleware.js");
const Usermodel = require("./models/userModel")

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("abc");
});

app.get("/eachuser",async(req,res)=>{

  const user = await Usermodel.find()
  res.send(user)
})

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message",messageRoutes)

app.use(notFound);
app.use(errorHandler);

// const PORT = process.env.PORT || 5000

const server = app.listen(5000, async () => {
  await connectdb();
  console.log(`server started on http://localhost:5000/`);
});

const io = require("socket.io")(server,{
  pingTimeout:60000,
  cors: { origin: "https://nem201-chat-app.vercel.app", }
})


io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
