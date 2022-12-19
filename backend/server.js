const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
// bodyParser help us convert any information that's coming from the body of our frontend or our frontend request
const cors =require("cors")

const app = express()

const PORT = process.env.PORT || 5005;

// Connect to DB and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT,() => {
            console.log(`Server Running on port ${PORT}`)
        })
    })
    .catch((err) => console.log(err))

// **MVC pattern of beauty and application create models routes controller