const express = require("express");
const { 
    registerUser,
    loginUser,
    logout, 
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    
} = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware")

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout); // send get request because we're not sending any data and we don't intend to send any data to this route
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser); // add protect to check user are login ใน protect จะมีการ verify token if true จะส่งข้อมูล user มาเพื่อเอาไปใช้อย่างอื่นต่อ
// HTTP.PATCH ใช้เมื่อ Client ส่งข้อมูลมาสู่ Server โดยมากจะใช้เพื่อทำการ Update ข้อมูลที่มีอยู่แล้วในระบบ แต่จะแตกต่างกัน ที่เห็นได้ชัดก็คือ ข้อมูลที่จะถูกส่งเข้ามา ไม่จำเป็นต้องส่งเข้ามาทั้งหมด ส่งมาแค่ฟิลด์ที่ต้องการจะแก้ไขเท่านั้น ฟิลด์ไหนที่ไม่ถูกส่งมาจะไม่ถูก Update
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;