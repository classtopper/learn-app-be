// routes/navbar.js
const express = require('express');
const router = express.Router();
const Navbar = require('../models/navbar');

// Get all navbars with caching
router.get('/', async (req, res, next) => {
    const cacheKey = 'navbars_data';
    let cachedData = req.cache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }
    try {
        const navbars = await Navbar.findAll({
            attributes: ['id', 'title'], 
            order: [['id', 'ASC']] 
        });

        const plainNavbars = JSON.parse(JSON.stringify(navbars));
        req.cache.set(cacheKey, plainNavbars);
        res.json(plainNavbars);
    } catch (error) {
        next(error);
    }
});

// Force recache of navbars
router.post('/recache', async (req, res) => {
    const cacheKey = 'navbars_data';
    try {
        const navbars = await Navbar.findAll({
            attributes: ['id', 'title'], // Only select id and title
            order: [['id', 'ASC']] // Order navbars by id ascending
        });

        // Cache only plain objects, JSON-parsed to ensure no cloning issues
        const plainNavbars = JSON.parse(JSON.stringify(navbars));

        req.cache.set(cacheKey, plainNavbars);
        res.json({ message: 'Navbars recached successfully' });
    } catch (error) {
        next(error);
    }
});

// Get a single navbar by id
router.get('/:id', async (req, res) => {
    const navbar = await Navbar.findByPk(req.params.id, {
        attributes: ['id', 'title']
    });
    res.json(navbar);
});

// Create a new navbar
router.post('/', async (req, res) => {
    const navbar = await Navbar.create(req.body);
    res.json(navbar);
});

// Update a navbar
router.put('/:id', async (req, res) => {
    const navbar = await Navbar.findByPk(req.params.id);
    navbar.update(req.body);
    res.json(navbar);
});

// Delete a navbar
router.delete('/:id', async (req, res) => {
    const navbar = await Navbar.findByPk(req.params.id);
    navbar.destroy();
    res.json({ message: 'Navbar deleted' });
});

module.exports = router;
