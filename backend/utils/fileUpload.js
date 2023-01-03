const multer = require("multer")

// Define file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads') // cb = callback and 1st parameter = null , 2nd = where folder we want to store file
    },
    filename: function (req, file, cb) {
        // original 
        //  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //  cb(null, file.fieldname + '-' + uniqueSuffix)

    // custom filename
    cb(null, new Date().toISOString().replace(/:/g,"-") +"-"+file.originalname) // replace : to - by regex
    }
})

// Specify file format that can be saved
function fileFilter (req, file, cb) {
    // Check file .PNG, .JPG, .jpeg
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        // To accept the file pass `true`, like so:
        cb(null, true)
    } else {
        // To reject this file pass `false`, like so:
        cb(null, false)
    }

    
  
}

//  File Size Formatter
const fileSizeFormatter = (bytes, decimal) => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const dm = decimal || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return (
      parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + " " + sizes[index]
    );
  };


const upload = multer({ storage, fileFilter })

module.exports = { upload, fileSizeFormatter }