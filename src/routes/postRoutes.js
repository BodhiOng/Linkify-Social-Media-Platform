const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');

// Define the upload directory
const uploadDir = path.join(__dirname, '../uploads');

// Check if the directory exists, if not create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Set up multer with limits and file filtering if necessary
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/; // Allow specific file types
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: File type not supported');
        }
    }
});

// Define routes and map them to controller functions
router.post('/', verifyToken, upload.single('image'), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:username', postController.getPostsByUsername);
router.put('/:id', verifyToken, postController.updatePostById);
router.delete('/:id', verifyToken, postController.deletePostById);

module.exports = router;