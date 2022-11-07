const express = require("express");
const protectMiddleware = require("../middlewares/auth.Middleware");
const protectMiddleware2 = require("../middlewares/dummy.Middleware");
const chatModel = require("../models/chatModel");
const UserModel = require("../models/userModel");
const app = express.Router();


app.post("/check", async(req, res)=>{
    
  const {userId} = req.body
  console.log(userId)
  res.send(userId)
    
} )
// accesschat
app.post("/", protectMiddleware, async (req, res) => {
  /// access chat name of controller function

  const { userId } = req.body;
  console.log(userId)
  if (!userId) {
    console.log("UserId param not send with requrest");
    return res.status(400).send("user not found");
  }

  var isChat = await chatModel.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await UserModel.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await chatModel.create(chatData);

      const FullChat = await chatModel.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      return res.status(200).send(FullChat);
    } catch (err) {
      return res.status(400).send(err.message);
    }
  }
});

// fetch chats
app.get("/", protectMiddleware, async (req, res) => {
  try {
    chatModel
      .find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await UserModel.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });

        return res.status(200).send(results);
      });
  } catch (err) {
    return res.send(err.message);
  }
});

// createGroupChat
app.post("/group", protectMiddleware, async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send("please fill all the fields");
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("more than 2 users are required to form a group chat");
  }

  users.push(req.user); // the current user who is making the group;

  try {
    const groupChat = await chatModel.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await chatModel
      .findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (err) {
    return res.send(err.message);
  }
});

// rename group
app.put("/rename", protectMiddleware, async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await chatModel
    .findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).send("chat not found");
  } else {
    res.json(updatedChat);
  }
});

// add to group
app.put("/groupadd", protectMiddleware, async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await chatModel.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  ).populate("users","-password")
  .populate("groupAdmin","-password")

  if(!added){
   return res.status(404).send("chat not found");
  }else{
    res.json(added)
  }



});

// remove from group
app.put("/groupremove", protectMiddleware, async (req, res) => {

    const {chatId,userId} = req.body
    const removed = await chatModel.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId},
        },
        {new:true}
    ).populate("users","-password")
    .populate("groupAdmin","-password")

    if(!removed){
      return  res.status(404).send("chat not found")
    }else{
        return res.json(removed)
    }

});

module.exports = app;
