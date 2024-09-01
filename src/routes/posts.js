const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middlewares/auth');
const postController = require('../controllers/postController');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Define routes and map them to controller functions
router.post('/', verifyToken, upload.single('image'), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:username', postController.getPostsByUsername);
router.put('/:id', verifyToken, postController.updatePostById);
router.delete('/:id', verifyToken, postController.deletePostById);

module.exports = router;