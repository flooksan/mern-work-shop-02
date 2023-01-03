const dotenv = require("dotenv").config();
/*
    https://www.npmjs.com/package/dotenv
    ถ้าเราไม่ require dotenv จะใช้ process.env ไม่ได้

    ทำความรู้จักกับ Dotenv ปลั๊กอินหนึ่งในหลายๆปลั๊กอินของ Next.js ซึ่ง Dotenv เป็นไฟล์ที่ใช้เก็บค่าพารามิเตอร์ต่างๆในขณะพัฒนา Web app 
    เช่นค่าการเชื่อมต่อ ฐานข้อมูล MongoDB ปกติเราจะตั้งชื่อไฟล์นี้ว่า .env 
    และเก็บไฟล์นี้ไว้บนเครื่อง local (PC, Mac, Linux) ที่พูดแบบนี้เพราะ 
    ปกตินักพัฒนา web app จะอัพโหลดงานไปไว้ที่ Github.com ซึ่งอาจเปิดค่าสาธารณะเอาไว้ (open source) 
    เราจึงต้องใส่ .env ไว้ใน .gitignore เพื่อป้องกันไม่ให้มันอัพโหลดไฟล์นี้ขึ้นไป 
*/
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// bodyParser help us convert any information that's coming from the body of our frontend or our frontend request
const cors =require("cors");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const contactRoute = require("./routes/contactRoute")
const errorHandler = require('./middleWare/errorMiddleware');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path")


const app = express();

//  Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan("dev"))
app.use("/uploads", express.static(path.join(__dirname, "uploads"))) // links to uploads folder

// Routes Middleware
app.use("/api/users/v1", userRoute)
app.use("/api/products/v1", productRoute)
app.use("/api/contactus/v1", contactRoute)
// Routes
app.get("/",(req,res)=>{
    res.send("Home Page");
});

//  Error Middleware
app.use(errorHandler); //ไม่ต้องใส่ () ไปที่หลัง errorHandler เราเรียกมันเป็นเป็นการอ้างถึงเฉยๆ ไม่ต้องใส่ () คือให้ app เรียกใช้ธรรมดา

const PORT = process.env.PORT || 5005;

// Connect to DB and start server
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT,() => {
            console.log(`Server Running on port ${PORT}`);
        })
    })
    .catch((err) => console.log(err));

// **MVC pattern of beauty and application create models routes controller