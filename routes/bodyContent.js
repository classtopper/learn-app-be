// routes/bodyContent.js
const express = require('express');
const BodyContent = require('../models/bodyContent');
const router = express.Router();

// Get body content (optionally filtered by sidebarId) with caching
router.get('/', async (req, res) => {
    try {
        const { sidebarId } = req.query;
        const cacheKey = 'bodyContents_data'; 
        let cachedData = req.cache.get(cacheKey);

        // If data is not cached, fetch from the database and cache it
        if (!cachedData) {
            const bodyContents = await BodyContent.findAll({
                attributes: ['id', 'content', 'sidebarId'],
                order: [['id', 'ASC']] // Order body contents by id ascending
            });

            // Cache the entire result set
            cachedData = JSON.parse(JSON.stringify(bodyContents));
            req.cache.set(cacheKey, cachedData);
        }

        // If a sidebarId is provided, filter the cached data
        let filteredData = cachedData;
        if (sidebarId) {
            filteredData = cachedData.filter(item => item.sidebarId == sidebarId);
        }

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force recache of bodyContents
router.post('/recache', async (req, res) => {
    const cacheKey = 'bodyContents_data';
    try {
        const bodyContents = await BodyContent.findAll({
            attributes: ['id', 'content', 'sidebarId'],
            order: [['id', 'ASC']] // Order body contents by id ascending
        });

        cachedData = JSON.parse(JSON.stringify(bodyContents));
        req.cache.set(cacheKey, cachedData);
        res.json({ message: 'BodyContents recached successfully' });
    } catch (error) {
        next(error);
    }
});

// Create a new body content
router.post('/', async (req, res) => {
    try {
        const bodyContent = await BodyContent.create(req.body);
        res.status(201).json(bodyContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a body content
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await BodyContent.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedBodyContent = await BodyContent.findOne({ where: { id: req.params.id } });
            res.status(200).json(updatedBodyContent);
        } else {
            res.status(404).json({ error: 'Body content not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a body content
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await BodyContent.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Body content not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
