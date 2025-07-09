// routes/image.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true }); 
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); 
        const originalName = path.basename(file.originalname, ext); 
        const fileName = originalName + ext; 
        const filePath = path.join(__dirname, '../uploads', fileName);
        
        // Check if file already exists
        if (fs.existsSync(filePath)) {
            cb(new Error('File already exists')); 
        } else {
            cb(null, fileName); 
        }
    }
});

const upload = multer({ storage });

// POST - Upload an image
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload an image' });
    }

    const imageUrl = `/images/${req.file.filename}`;
    res.json({ message: 'Image uploaded successfully', imageUrl });
});


// GET - Get all uploaded images with caching
router.get('/', (req, res) => {
    const cacheKey = 'images_data';

    // Check if data is in cache
    const cachedData = req.cache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }

    const uploadDir = path.join(__dirname, '../uploads');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to retrieve images' });
        }
        const images = files.map(file => `/images/${file}`);

        // Store data in cache
        req.cache.set(cacheKey, images);

        res.json(images);
    });
});

// Force recache of images
router.post('/recache', (req, res) => {
    const cacheKey = 'images';

    const uploadDir = path.join(__dirname, '../uploads');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to retrieve images' });
        }
        const images = files.map(file => `/images/${file}`);

        // Store data in cache
        req.cache.set(cacheKey, images);

        res.json({ message: 'Images recached successfully' });
    });
});

module.exports = router;
