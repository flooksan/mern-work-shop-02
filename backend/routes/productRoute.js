const express = require("express");
const { createProduct, getProducts, getProduct, deleteProduct, updateProduct } = require("../controllers/productController");
const protect = require("../middleWare/authMiddleware");
const { upload } = require("../utils/fileUpload");
const router = express.Router();


router.post("/", protect, upload.single("image"), createProduct); // upload ถ้า upload > 1 file ให้ใส่เป็น .array
router.patch("/:id", protect, upload.single("image"), updateProduct);
router.get("/", protect, getProducts);
router.get("/:id", protect, getProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;