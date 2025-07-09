// routes/choice.js

const express = require('express');
const router = express.Router();
const Choice = require('../models/choice');

// Get all choices (optionally filtered by quizId) with caching
router.get('/', async (req, res) => {
    try {
        const { quizId } = req.query;
        const cacheKey = 'choices_data'; 
        let cachedData = req.cache.get(cacheKey);

        if (!cachedData) {
            const choices = await Choice.findAll({
                attributes: ['id', 'optionText', 'quizId'], 
                order: [['id', 'ASC']] 
            });

            cachedData = JSON.parse(JSON.stringify(choices));
            req.cache.set(cacheKey, cachedData);
        }

        let filteredData = cachedData;
        if (quizId) {
            filteredData = cachedData.filter(item => item.quizId == quizId);
        }

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force recache of choices
router.post('/recache', async (req, res) => {
    const cacheKey = 'choices_data';
    try {
        const choices = await Choice.findAll({
            attributes: ['id', 'optionText', 'quizId'], 
            order: [['id', 'ASC']]  
        });

        cachedData = JSON.parse(JSON.stringify(choices));
        req.cache.set(cacheKey, cachedData);
        res.json({ message: 'Choices recached successfully' });
    } catch (error) {
        next(error);
    }
});

// Create a choice
router.post('/', async (req, res) => {
    try {
        const choice = await Choice.create(req.body);
        res.status(201).json(choice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a choice
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Choice.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedChoice = await Choice.findOne({ where: { id: req.params.id } });
            res.status(200).json(updatedChoice);
        } else {
            res.status(404).json({ error: 'Choice not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a choice
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Choice.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Choice not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
