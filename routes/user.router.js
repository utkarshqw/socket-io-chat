const express = require("express");
const generateToken = require("../config/generateToken");
const { registerUser } = require("../controllers/userControllers");
const protectMiddleware = require("../middlewares/auth.Middleware");
const UserModel = require("../models/userModel")


const app  = express.Router()

app.post("/", registerUser)

app.post("/login", async(req,res)=>{

const {email,password} = req.body;

const user = await UserModel.findOne({email})

if(user && (await user.matchPassword(password)) )
{
    res.status(201).send({
        msg:"successfully logged in",
        _id:user.id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        
        token:generateToken(user._id)
    })
}else{
    res.send("Invalid email or Password")
}

})

// get all users

app.get("/allusers",protectMiddleware,async(req,res)=>{

    const keyword = req.query.search ? {
        $or:[
            {name:{$regex:req.query.search,$options:"i"}},
            {email:{$regex:req.query.search, $options:"i"}},
            
        ]
    }:{};

    const users =  await UserModel.find(keyword).find({_id:{$ne:req.user._id}})
    res.send(users)

})

module.exports = app