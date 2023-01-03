const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require('cloudinary').v2; // Require the Cloudinary library

// Create Product
const createProduct = asyncHandler( async (req, res) => {
    const { name, sku, category, quantity, price, description, } = req.body

    // Validateion
    if (!name || !category || !quantity || !price || !description) {
        res.status(400)
        throw new Error("Please fill in all fields")
    }
    /*  
        สามารถ validate โดยที่เราเจาะจงแจ่ละ field ดังด้านล่าง
        const name = null;
        const category = null;
        const quantity = 1;
        const price = 1;
        const description = 1;

        const arr = [
            {name : null},
            {category : null},
            {quantity : 1},
            {price : 1},
            {description : 1},
        ]

        arr.map(item => {
            if (Object.values(item) != 1) {
                console.log(`Please fill in ${Object.keys(item)} fields`)
            }
        })
    
    */

    // Handle Image upload 
        // **ก่อนจะทำการ Upload ต้องลง npm i multer ก่อน
    let fileData = {};
    if (req.file) {

        // Upload file(image) to Cloudinary
        let uploadedFile;
        try {
            
            uploadedFile = await cloudinary.uploader
                                    .upload(req.file.path, 
                                            { folder: "Pinvent App", resource_type: "image" });
            // https://cloudinary.com/documentation/node_quickstart ไกด์ในไกด์มีการบอกให้เอา API ไปเก็บใน .env ไม่งั้น upload ไม่ได้
            // file image ที่ต้องการ save , object สร้าง folder ที่จะเอาไปเก็บไฟล์ และ ประเภทของไฟล์
            // ลองใส่ cloudinary.v2.uploader.upload แล้วกด upload ไม่ได้ HTTP โชว์ 500
            // console.log(uploadedFile)
            /* 
                object ที่ได้จาก uploadedFile
                {
                    asset_id: '7f194643a5ed701fec8c485a2e2bf6ff',
                    public_id: 'Pinvent App/qcd8fa9dxwkd1xl1hrgz',
                    version: 1672669483,
                    version_id: '843d1159d62512cc1ec50cf6c1995413',
                    signature: '5809103606da24d9ceaeeca1f2c27b347e554c06',
                    width: 386,
                    height: 256,
                    format: 'jpg',
                    resource_type: 'image',
                    created_at: '2023-01-02T14:24:43Z',
                    tags: [],
                    bytes: 20907,
                    type: 'upload',
                    etag: '42e66bc620c43ffc447d1aad6ba171d7',
                    placeholder: false,
                    url: 'http://res.cloudinary.com/dhqt95e6h/image/upload/v1672669483/Pinvent%20App/qcd8fa9dxwkd1xl1hrgz.jpg',
                    secure_url: 'https://res.cloudinary.com/dhqt95e6h/image/upload/v1672669483/Pinvent%20App/qcd8fa9dxwkd1xl1hrgz.jpg',
                    folder: 'Pinvent App',
                    original_filename: '2023-01-02T14-24-42.345Z-Product-test-01',
                    original_extension: 'JPG',
                    api_key: '931847163734177'
                }
            */
        } catch (error) {
            res.status(500)
            throw new Error("Image could'nt be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            // filePath: req.file.path, อันเดิมเราให้ upload file ลงเครื่องแต่ด้านล่างใช้ cloudinary
            filePath: uploadedFile.secure_url, // ดูได้จากด้านบนเมื่อ อัพรูปไปที่ cloudinary จะได้ url มาใช้
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2), // fileSizeFormatter recieve 2 param (bytes, decimal) 
        }
    }

    // Create Product
    const product = await Product.create({
        user: req.user.id, // เป็น data ที่ถูกส่งมาจาก protect ใน authMiddleware ใน line 25
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData,
    });

    res.status(201).json(product);
    /* 
        Test add on Insomnia
        {
            "_id": {
                "$oid": "63b2a64649f3ae434ae624d3"
            },
            "user": {
                "$oid": "63b00dcd62f9575551697e75" >> มาจาก req.user.id จากที่ส่งมาจาก protect middleware
            },
            "name": "Product-test-01",
            "sku": "SKU-test-01",
            "category": "Electronics",
            "quantity": "5",
            "price": "1000",
            "description": "Test route and controller create product",
            "createdAt": {
                "$date": {
                "$numberLong": "1672652358744"
                }
            },
            "updatedAt": {
                "$date": {
                "$numberLong": "1672652358744"
                }
            },
            "__v": 0
        }
        
    
    */


});


// Get all Products
const getProducts = async (req, res) => {
    try {
        // const productsold = await Product.find({user: req.user.id}).sort("-createdAt") // find product of user and sort by new sort เขียนได้ 2 แบบ แบบนี้กับแบบด้านล่าง
        const products = await Product.find({user: req.user.id}).sort({createdAt: -1})
        res.status(200).send(products)
    } catch (error) {
        console.log(error);
    }
};

// Get single product
const getProduct = async (req, res) => {
    try {
        // Check product มี/ไม่มี
        const product = await Product.findById(req.params.id)
        if (!product) {
            res.status(404)
            throw new Error("Product not found")
        }

        // Check product ด้านบนว่า user ที่ขอดู product นี้ดูได้ไหม Match product to it's user
        if (product.user.toString() !== req.user.id) {
            res.status(401)
            throw new Error("User not authorized")
        }

        // Response
        res.status(200).json(product);

    } catch (error) {
        console.log(error);
    }
};

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
    // If product does'nt exist
    if (!product) {
        res.status(404)
        throw new Error("Product not found")
    }
    // Match product to it's user
    if (product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("User not authorized")
    }
    await product.remove()
    res.status(200).json({message: "Product deleted!"});

});

// Update Product
const updateProduct = asyncHandler( async (req, res) => {
    const { name, category, quantity, price, description, } = req.body
    const {id} = req.params

    const product = await Product.findById(id)
    
    // If product does'nt exist
    if (!product) {
        res.status(404)
        throw new Error("Product not found")
    }
    // Match product to it's user pass user product to string for compare
    if (product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("User not authorized")
    }

    // Validateion
    if (!name || !category || !quantity || !price || !description) {
        res.status(400)
        throw new Error("Please fill in all fields")
    }

    // Handle Image upload 
    let fileData = {};
    if (req.file) {

        let uploadedFile;
        try {
            
            uploadedFile = await cloudinary.uploader
                                    .upload(req.file.path, 
                                            { folder: "Pinvent App", resource_type: "image" });
        } catch (error) {
            res.status(500)
            throw new Error("Image could'nt be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),  
        }
    }

    // Update Product

    const updatedProduct = await Product.findByIdAndUpdate(
        {_id: id},
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? product.image : fileData , 
        },
        {
            new: true, // update fuctionality = i'm making some new modifications outside
            runValidators: true, // ให้มีการตรวจสอบข้อมูลที่เข้ามาด้วยเช่น ค่า name ใน schema เราใส่ required เป็น true ก็ต้องตรวจสอบ
            // https://mongoosejs.com/docs/validation.html เพิ่มเติม
        }
    )

    // const updatedProduct = await Product.create({
    //     user: req.user.id, // เป็น data ที่ถูกส่งมาจาก protect ใน authMiddleware ใน line 25
    //     name,
    //     sku,
    //     category,
    //     quantity,
    //     price,
    //     description,
    //     image: fileData,
    // });

    res.status(200).json(updatedProduct);

});


module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
};

