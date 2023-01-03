const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");



const contactUs = asyncHandler(async (req, res) => {
    const { subject, message } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
        res.status(404)
        throw new Error("User not found, please signuyp")
    }
    
    // Validation email content
    if (!subject || !message) {
        req.status(400)
    }

            // console.log(user.email)
    // Email send
    const send_to = process.env.EMAIL_USER;
    const send_from = process.env.EMAIL_USER;
    const reply_to = user.email;
    try {
        await sendEmail(subject, message, send_to, send_from, reply_to)
        res.status(200).json({
            success: true,
            message: "Email Sent"
        })
    }catch (error) {
        res.status(500)
        throw new Error("Email not sent, please try again")
    }

});

module.exports = contactUs;