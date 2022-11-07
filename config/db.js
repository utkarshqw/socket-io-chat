const mongoose = require("mongoose")

const connect = () => {

    return mongoose.connect("mongodb+srv://Utkarsh:1234@cluster0.avafjsi.mongodb.net/socketioproject")
}

module.exports = connect
