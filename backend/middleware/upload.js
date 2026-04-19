const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary with your environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Set up the Cloudinary storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'my-portfolio', 
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    },
});

// 3. Initialize Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
});

module.exports = upload;