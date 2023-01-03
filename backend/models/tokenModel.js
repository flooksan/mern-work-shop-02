const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"

    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },

})

const Token = mongoose.model("Token",tokenSchema)
module.exports = Token

/*
    จะมีการ install nodemailer เพื่อให้ส่งเมลล์ง่ายๆ
    Nodemailer is a module for Node.js applications to allow easy as cake email sending. 
    The project got started back in 2010 when there was no sane option to send email messages, 
    today it is the solution most Node.js users turn to by default.
*/