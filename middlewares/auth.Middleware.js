
const jwt = require("jsonwebtoken")
const UserModel = require("../models/userModel")


const protectMiddleware =  async(req,res,next) => {

    let token;

    if(
        req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    ){
        try{
            token = req.headers.authorization.split(" ")[1];

            // decode token id
            const decoded = jwt.verify(token,process.env.JWT_SECRET)

            req.user = await UserModel.findById(decoded.id).select("-password");

            next()
        }catch(err){
           return  res.status(401).send("Not authorized, token failed");
            
        }
    }

    if(!token){
       return   res.status(401).send("Not authrorized, no token");
    }
}


const protectMiddleware2 =  async(req,res,next) => {

    let token;

    // if(
    //     req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    // ){
        try{
            token = req.body.token.split(" ")[1];

            // decode token id
            const decoded = jwt.verify(token,process.env.JWT_SECRET)

            req.user = await UserModel.findById(decoded.id).select("-password");

            next()
        }catch(err){
           return  res.status(401).send("Not authorized, token failed");
            
        }
    // }

    if(!token){
       return   res.status(401).send("Not authrorized, no token");
    }
}


module.exports = protectMiddleware