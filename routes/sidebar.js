// routes/sidebar.js
const express = require('express');
const Sidebar = require('../models/sidebar');
const router = express.Router();

// Get all sidebars (optionally filtered by navbarId) with caching
router.get('/', async (req, res) => {
    try {
        const { navbarId } = req.query;
        const cacheKey = 'sidebars_data'; 
        let cachedData = req.cache.get(cacheKey);

        if (!cachedData) {
            const sidebars = await Sidebar.findAll({
                attributes: ['id', 'title', 'order', 'navbarId'], 
                order: [['id', 'ASC']] 
            });

            cachedData = JSON.parse(JSON.stringify(sidebars));
            req.cache.set(cacheKey, cachedData);
        }

        let filteredData = cachedData;
        if (navbarId) {
            filteredData = cachedData.filter(item => item.navbarId == navbarId);
        }

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force recache of sidebars
router.post('/recache', async (req, res) => {
    const cacheKey = 'sidebars_data';
    try {
        const sidebars = await Sidebar.findAll({
            attributes: ['id', 'title', 'order', 'navbarId'], 
            order: [['id', 'ASC']]  
        });

        cachedData = JSON.parse(JSON.stringify(sidebars));
        req.cache.set(cacheKey, cachedData);
        res.json({ message: 'Sidebars recached successfully' });
    } catch (error) {
        next(error);
    }
});

// Create a sidebar
router.post('/', async (req, res) => {
    try {
        const sidebar = await Sidebar.create(req.body);
        res.status(201).json(sidebar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a sidebar
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Sidebar.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedSidebar = await Sidebar.findOne({ where: { id: req.params.id } });
            res.status(200).json(updatedSidebar);
        } else {
            res.status(404).json({ error: 'Sidebar not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a sidebar
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Sidebar.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Sidebar not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
