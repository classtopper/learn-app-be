// routes/answer.js
const express = require('express');
const Answer = require('../models/answer');
const router = express.Router();

// Get all answers (optionally filtered by questionId) with caching
router.get('/', async (req, res) => {
    try {
        const { questionId } = req.query;
        const cacheKey = 'answers_data'; 
        let cachedData = req.cache.get(cacheKey);

        if (!cachedData) {
            const answers = await Answer.findAll({
                attributes: ['id', 'title', 'questionId'], 
                order: [['id', 'ASC']] 
            });

            cachedData = JSON.parse(JSON.stringify(answers));
            req.cache.set(cacheKey, cachedData);
        }

        let filteredData = cachedData;
        if (questionId) {
            filteredData = cachedData.filter(item => item.questionId == questionId);
        }

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force recache of answers
router.post('/recache', async (req, res) => {
    const cacheKey = 'answers_data';
    try {
        const answers = await Answer.findAll({
            attributes: ['id', 'title', 'questionId'], 
            order: [['id', 'ASC']]  
        });

        cachedData = JSON.parse(JSON.stringify(answers));
        req.cache.set(cacheKey, cachedData);
        res.json({ message: 'Answers recached successfully' });
    } catch (error) {
        next(error);
    }
});

// Create a answer
router.post('/', async (req, res) => {
    try {
        const answer = await Answer.create(req.body);
        res.status(201).json(answer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a answer
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Answer.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedAnswer = await Answer.findOne({ where: { id: req.params.id } });
            res.status(200).json(updatedAnswer);
        } else {
            res.status(404).json({ error: 'Answer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a answer
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Answer.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Answer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
