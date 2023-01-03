const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    name: {
        type: String,
        required: [true, "Please add a name"], // add required value in array when user don't input name return message Please add a name
        trim: true, // If there is any space around the name, we r going to trim it.
    },
    sku: { // An unique number to identify product
        /*
            Stock Keeping Unit หรือ SKU คือ รหัสสินค้าที่มีการจำแนกประเภทสินค้าได้ละเอียดที่สุด 
            ถูกออกแบบมาเพื่อให้ผู้ผลิต เจ้าของร้าน หรือผู้ซื้อสามารถแบ่งแยกความแตกต่างของสินค้าแต่ละชิ้นได้ 
            และไม่ให้เกิดความสับสนในการสั่งซื้อสินค้า การเลือกซื้อสินค้าอาจมีลวดลาย สี หรือขนาดให้เลือกหลากหลายรูปแบบ 
            หรือมีความใกล้เคียงกัน การแจ้งเป็น SKU จึงช่วยให้ทุกฝ่ายสามารถสื่อสารกันได้ง่ายขึ้น
         */
        type: String,
        required: true,
        default: "SKU", 
        trim:true,
    },
    category: { 
        type: String,
        required: [true, "Please add a category"],
        trim:true,
    },
    quantity: { 
        type: String,
        required: [true, "Please add a quantity"],
        trim:true,
    },
    price: { 
        type: String,
        required: [true, "Please add a price"],
        trim:true,
    },
    description: { 
        type: String,
        required: [true, "Please add a description"],
        trim:true,
    },
    image: { 
        type: Object,
        default:{}, // ไม่ตั้งให้ต้องการรูปเพราะภาพ user ไม่ต้องการใส่รูป default ตั้งเป็น object เปล่า
    },  
    

}, {
    timestamps: true,
});

const Product = mongoose.model("Product",productSchema);
module.exports = Product;