const generateToken = require("../config/generateToken");
const UserModel = require("../models/userModel")

const registerUser = async (req,res)=>{

    const {name, email,password, pic} = req.body;

    if(!name || !email || !password){
      return   res.status(400).send("please Enter all the Feilds")
    }
     
    const userExists = await UserModel.findOne({email})
    if(userExists)
    {
      return   res.status(400).send("User already exists")
    }

    const user = await UserModel.create({
        name, email,password,pic
    });
    
    if(user){
    res.status(201).send({
        _id:user.id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        
        token:generateToken(user._id)
    })
}else{
    res.status(400).send("failed to make User")
}

}




module.exports = {registerUser}