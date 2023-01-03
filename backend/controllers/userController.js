

// const registerUser = async (req,res) => {
//     res.send("Register User")
// };

// const registerUser = async (req,res) => {
//     // Error handler of email
//     if (!req.body.email) {
//         res.status(400);
//         throw new Error("Please add and email");
//     }
//     res.send("Register User")
// };

// -------------------------------------------------------------------------------------------------------


const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt =require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate Token function
const generateToken =(id) => {
    // gen token ใส่ id และ jwt secret ไป รวมถึงเวลาหมดอายุด้วย ถ้าหมด logout auto
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
}

// Register User
    // ก่อนทำลง npm i express-async-handler ก่อนด้วย  มันเอามาใช้แทน syntax try {} catch (error) {} ของ async
    // Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.
const registerUser = asyncHandler(async (req,res) => {
   const {name, email, password} = req.body 
   
   // Validation
   if (!name || !email || ! password) {
    res.status(400)
    throw new Error("Please fill in all required fields")
   }
   if (password.length <6) {
    res.status(400)
    throw new Error("Password must be up to 6 characters")
   }
   
   // Check if user email already exists
   const userExists = await User.findOne({email}) //find email email ถูก destructure แล้วสามารถะเขียนแบบนี้ได้เลย
   if (userExists) {
    res.status(400)
    throw new Error("Email has already been registered")
   }

   

            // Encrypt pass before saving to DB เอาไปทำใน model
            // const salt = await bcrypt.genSalt(10) // 1.how long to gen hash pass
            // const hashedPassword = await bcrypt.hash(password, salt) // 2. hash pass  input arg.1 = password to hash arg.2 = salt


   // Create new user
    // จะเห็นว่าเราไม่เอา password มาโชว์ ไม่มีใคร save password ไว้ตรงๆ
   const user = await User.create({ 
    name, email, 
    // password: hashedPassword, มันถูก hash ตอนส่งไปที่หน้า model userSchema หลังบ้าน 
    // ที่ต้องทำแบบนี้เพราะในอนาคตมีการ reset password ด้วยถ้าเราเขียนใน register ก็ต้องไปเขียนซ้ำอีกรอบที่ reset password
    password, // frontend send normal password to backend model for hash
})
    // Generate Token
   const token = generateToken(user._id) // ถ้า user ถูก gen เราจะเอามา gen token ใช้ login อีกที 

    // Send HTTP-only cookie เราจะไม่เก็บ token ใน local storage เพราะไม่ค่อยปลอดภัยเพราะจะทำให้โดน hack ได้เราจะเอาไปเก็บใน cookie แทน
    // name , ตัวแปรที่จะเอามาเก็บใน name , object ที่จะบอกว่าจะเก็บที่ไหน
    res.cookie("token", token, {
        path: "/",
        httpOnly: true, // cookie can use only by web server
        expires: new Date(Date.now() + 1000 * 86400), // expires in 1day
        sameSite: "none",
        secure: true, // make cookie can use only with https
        
    })
        // ลองส่ง cookie ใน insomnia มันจะอยู่ในหน้า Cookies ชื่อว่า token ตามที่เราตั้งไว้

   if (user) {
    const {_id, name, email, photo, phone, bio} = user
    // The HTTP 201 Created success status response code indicates that the request has succeeded
    res.status(201).send({
        // _id: user.id, เขียนแบบ destucture เอาด้านบน
        _id, name, email, photo, phone, bio, token,
        
    })
   } else {
    res.status(400)
    throw new Error("Invalid user data")
   }

});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    // Validate Request
    if (!email || !password) {
        res.status(400)
        throw new Error("Please add email and password");
    }

    // Check if user exists
    const user = await User.findOne({email})
    if (!user) {
        res.status(400)
        throw new Error("User not found, please signup");
    }

    // User exists, check if password is correct
        // use bcrypt to compare password user input on login to user.password we find on database line 108
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    // console.log(passwordIsCorrect)

    // Generate Token
    const token = generateToken(user._id)
    // ส่ง cookie ไปเก็บที่ front 
    res.cookie("token", token, {
        path: "/",
        httpOnly: true, // cookie can use only by web server
        expires: new Date(Date.now() + 1000 * 86400), // expires in 1day
        sameSite: "none",
        secure: true, // make cookie can use only with https
        
    });

    if (user && passwordIsCorrect) {
        // destructure all information like we save before register from user we find on database at line 108
        // And with that we can now know that this user is properly validated ให้ user access to our application or log the user in
        const {  _id, name, email, photo, phone, bio,  } = user; 
        res.status(200).json({
            _id, name, email, photo, phone, bio, token, //token เป็น token ที่เราเก็บไว้
        });
    } else {
        res.status(400)
        throw new Error("Invalid email or password!!");
    }


});

// Logout User
const logout = asyncHandler(async(req, res) => {
    // 2 way to logout 1. frontend delete cookie 2. backend make expire
    res.cookie("token", "", {
        path: "/",
        httpOnly: true, // cookie can use only by web server
        expires: new Date(0), // expires in 1day
        sameSite: "none",
        secure: true, // make cookie can use only with https
        
    })
    return res.status(200).json({ message: "Success Logged Out !" })
});

// Get User Data
const getUser = asyncHandler(async (req, res)=>{
    console.log("getUser : ",req.user); // req.user เป็น req.user ที่ส่งมาจาก protect ของ authMiddleware.js
    const user= await User.findById(req.user._id);

    if (user) {
        const {_id, name, email, photo, phone, bio} = user;
        res.status(201).send({
            _id, name, email, photo, phone, bio, 
            
        });
       } else {
        res.status(400);
        throw new Error("User Not Found")

       }
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false)
    }
    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if (verified) {
        return res.json(true)
    }
    return res.json(false)
});

// updateUser
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
        const { name, email, photo, phone, bio} = user;
        user.email = email; // ไม่ต้องการให้ปลี่ยน email
        user.name = req.body.name || name; // ถ้ามี req มาเพื่อเปลี่ยน ชื่อ ก็จะให้เปลี่ยนชื่อ
        user.photo = req.body.photo || photo;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;

        const updatedUser = await user.save() // เป็นการ save โดยจะไป findById ก่อนแล้วมา save ต่อแต่ข้อมูลที่เสพตอนนี้จะเปลี่ยนไปแล้ว
        res.status(200).json({
            _id: updatedUser._id, 
            name: updatedUser.name, 
            email: updatedUser.email, 
            photo: updatedUser.photo, 
            phone: updatedUser.phone, 
            bio: updatedUser.bio
        })

    } else {
        res.status(404)
        throw new Error("User not found!")
    }
});


const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    const { oldPassword, password } = req.body
    
    if (!user) {
        res.status(400)
        throw new Error("User not found, please signup")
    }
    
    // Validate
    if (!oldPassword || !password) {
        res.status(400)
        throw new Error("Please add old and new password")
    }

    if (oldPassword == password) {
        res.status(400)
        throw new Error("Newpassword can't match oldpassword")
        
    }

    // Check if oldpassword matches password in DN
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password) // ใช้ bcrypt compare ว่ารหัสเก่าที่เราใส่ไปนั้นพอไปเทียบกับ DB แล้วตรงกัน
     
    // Save new password
    if (user && passwordIsCorrect) {
        user.password = password
        await user.save()
        res.status(200).send("Password change successful!")
    } else {
        res.status(400)
        throw new Error("Old password is incorrect!")
    }
});


const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body
    // Check email
    const user = await User.findOne({email})
    
    if(!user) {
        res.status(404)
        throw new Error("User does not exist")
    }

    // Delete token if it exists in DB เป็นการลบ token ถ้าหากในฐานข้อมูลมี token อันอื่น ก่อนสร้างอันใหม่
    let token = await Token.findOne({userId: user._id})
    if (token) {
        await token.deleteOne() // ถ้าหาเจอเราก็จะให้มันไป delete token อันเดิม ออกเลย
    }

    // Create Reset Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id; // import const crypto = require("crypto") ด้วย
    console.log(resetToken);

    // Hash token before saving to DB
        // use createHash from crypto defind rule for hash and update = resetToken we need to hash
    const hasedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    
    //  Save Token to DB
    await new Token({
        userId: user._id,
        token: hasedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000) // token หมดเวลาภายใน 30 นาที
    }).save()

    // Construct Reset Url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // Reset Email 
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>
        <p>This reset link is valid for only 30 minutes.</p>
        
        <a href=${resetUrl} clicktracking=off >${resetUrl}</a>

        <p>Regards...</p>
        <p>Kloof.dev Team</p>
    `
    const subject = "Password Reset Request"
    const send_to = user.email
    const send_from = process.env.EMAIL_USER
    const reply_to = "patipanmata@gmail.com"

    try {
        await sendEmail(subject, message, send_to, send_from, reply_to)
        res.status(200).json({
            success: true,
            message: "Reset Email Sent"
        })
    }catch (error) {
        res.status(500)
        throw new Error("Email not sent, please try again")
    }
    

})


// Reset Password
const resetPassword = asyncHandler( async(req, res) => {
    const {password} = req.body
    const {resetToken} = req.params
    //  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`; resetToken มาจาก ตรงนี้ที่เราส่งเมลล์ให้ user ไปกดลิงค์มาเพื่อแก้ไขรหัสผ่าน

    // Hash token, then compare to Token in DB
        const hasedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Find token in DB
    const userToken = await Token.findOne({
        token: hasedToken, // หา token by hasedToken
        expiresAt: {$gt: Date.now()}, // Check token are exp. by check with now 
    })

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired Token")
    }

    //  Find user 
    const user = await User.findOne({ _id: userToken.userId }) 
        // userToken.userId หมายความว่าเราจะไปหาส่วนของ userToken
    user.password = password // ตั้ง password ใหม่เป็น password ที่เพิ่งส่งเข้ามาใน req.body
    await user.save()
    res.status(200).json({
        message: "Password Reset Successful, Please Login"
    })

    // Delete token when reset password
})

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
};

